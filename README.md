InternConnect: Internship Matching System
Project Overview
InternConnect is a web application designed to help students and job seekers find internship opportunities that are a perfect match for their skills, interests, and location. Built with Python and the Flask framework, the application uses a custom algorithm to analyze user profiles and suggest the most relevant internships from a provided dataset.

A key feature of this project is its built-in feedback loop, which records accepted internships to a separate CSV file. This data can be used to refine the matching algorithm over time, making the system smarter and more accurate.

Key Features
Smart Matching Algorithm: The core of the application is a custom compute_score function that calculates a confidence score for each internship based on a user's profile.

Profile Creation: Users can easily input their skills, interests, and preferred location to generate a personalized profile.

Personalized Matches: The application presents a sorted list of the top 10 internship suggestions based on the matching algorithm.

Feedback Loop: A unique feature that records accepted internships to a separate CSV file, creating a dataset for future improvements to the matching algorithm.

Resume Builder: A dedicated tool that allows users to create a professional resume based on their personal and professional details.

Simple Technology Stack: The project is built using Python, Flask, and CSV files, making it easy to understand, manage, and extend.

Project Structure
hackathon/
├── app.py                  # The main Flask application file
├── internships.csv         # Dataset of all internship opportunities
├── accepted_internships.csv# Stores accepted internships for feedback/training
├── templates/
│   ├── index.html          # The home page
│   ├── profiles.html       # The profile creation page
│   ├── matches.html        # The page to display internship matches
│   └── resume_builder.html # The resume builder page
└── static/
    ├── styles.css          # All CSS for styling the application
    ├── script.js           # All JavaScript for dynamic functionality
    └── images/             # Folder for all static images
        └── hero-image.jpg  # Main image for the home page

How to Run the Project
To set up and run this project on your local machine, follow these steps:

Clone the repository: If you're using a version control system, clone the project to your local directory.

Navigate to the project directory: Open your terminal or command prompt and change to the hackathon directory.

Install dependencies: Make sure you have Python installed. Then, install the required libraries using pip:

pip install Flask pandas

Run the application: Execute the main Python file to start the Flask server:

python app.py

Access the application: Open your web browser and navigate to the address shown in your terminal (e.g., http://127.0.0.1:5000).

Core Logic: The compute_score Method
The heart of the matching process is the compute_score function within app.py. This function takes a user's profile and an internship's details and returns a confidence score.

The score is calculated using a weighted formula:
confidence_score = (skills_ratio * 0.5) + (interests_ratio * 0.3) + (location_score * 0.2)

skills_ratio: Measures the percentage of the job's required skills that match the user's skills.

interests_ratio: Measures the percentage of the job's listed interests that match the user's interests.

location_score: An all-or-nothing score that adds a fixed percentage if the user's preferred location matches the internship's location.

Future Enhancements
Implement a full database (e.g., PostgreSQL) instead of CSV files for better scalability and performance.

Introduce user authentication to allow users to save their profiles and match history.

Develop a more sophisticated machine learning model to improve the matching algorithm based on user feedback.

Add a visual representation (e.g., charts) of the match data.
