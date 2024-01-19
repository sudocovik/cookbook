import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Create a GCP Storage Bucket to hold the static file
const storageBucket = new gcp.storage.Bucket("static-files-bucket", {
    location: "EU",
    website: {
        mainPageSuffix: "index.html",
    },
});

// Upload index.html to the Storage Bucket
const staticFile = new gcp.storage.BucketObject("index-html", {
    bucket: storageBucket.name,
    name: "index.html",
    source: new pulumi.asset.FileAsset("dist/cookbook.html"), // Local path to the index.html file
    contentType: "text/html", 
});

// Grant public read access to all objects in the bucket
const iamBinding = new gcp.storage.BucketIAMBinding("public-access", {
    bucket: storageBucket.name,
    role: "roles/storage.objectViewer",
    members: ["allUsers"],
});

// Create the managed SSL certificate
const managedSslCertificate = new gcp.compute.ManagedSslCertificate("managed-cert", {
    managed: {
        domains: ["cookbook.zth.dev"],
    }
});

// Create a GCP Backend Bucket using the uploaded file
const backendBucket = new gcp.compute.BackendBucket("static-files-backend", {
    bucketName: storageBucket.name,
    enableCdn: true,
});

// Create a URL map for the load balancer
const urlMap = new gcp.compute.URLMap("url-map", {
    defaultService: backendBucket.selfLink,
});

// Create a Target HTTPS Proxy that uses the managed SSL certificate
const targetHttpsProxy = new gcp.compute.TargetHttpsProxy("https-proxy", {
    urlMap: urlMap.id,
    sslCertificates: [managedSslCertificate.id],
});

// Create the Global Forwarding Rule for HTTPS traffic
const httpsForwardingRule = new gcp.compute.GlobalForwardingRule("https-forwarding-rule", {
    target: targetHttpsProxy.id,
    portRange: "443",
});

// Output the DNS name of the load balancer to access the static site
export const loadBalancerDnsName = httpsForwardingRule.ipAddress;
