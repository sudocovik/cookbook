# Use an official TeX Live image as the base image
FROM danteev/texlive:latest AS base

# Set the working directory
WORKDIR /app

# Copy the LaTeX files into the container
COPY cookbook.tex .

# Compile the LaTeX file to generate the PDF
RUN pdflatex cookbook.tex

# Clean up unnecessary files
RUN rm -rf *.aux *.log *.out

# Specify the command to run when the container starts
CMD ["pdflatex", "cookbook.tex"]

FROM scratch AS output
COPY --from=base /app/cookbook.pdf .