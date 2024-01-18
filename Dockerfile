# Use an official TeX Live image as the base image
FROM danteev/texlive:latest AS base

# Set the working directory
WORKDIR /app

# Copy the LaTeX files into the container
COPY cookbook.tex .

# Install wget and unzip (needed for Pandoc installation)
RUN apt-get update && \
    apt-get install -y wget unzip

# Download and install Pandoc version 3.1.11.1
RUN wget https://github.com/jgm/pandoc/releases/download/3.1.11.1/pandoc-3.1.11.1-linux-amd64.tar.gz && \
    tar -xzf pandoc-3.1.11.1-linux-amd64.tar.gz && \
    cp pandoc-3.1.11.1/bin/pandoc /usr/local/bin/ && \
    rm -rf pandoc-3.1.11.1-linux-amd64.tar.gz pandoc-3.1.11.1

# Specify the command to run when the container starts
RUN pandoc -s cookbook.tex -o cookbook.html \
    && rm -rf *.aux *.log *.out

FROM scratch AS output
COPY --from=base /app/cookbook.html .