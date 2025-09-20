from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import os
import csv

app = Flask(__name__)

CSV_FILE = "internships.csv"
ACCEPTED_FILE = "accepted_internships.csv"
ACCEPTED_FIELDNAMES = ["title", "company", "confidence", "reason", "Preferred_Location", "User_Skills", "User_Interests"]


training_stats = {"total_shown": 0, "accepted": 0}

# --- Improved matching logic ---
def compute_score(user, job):
    job_skills = [s.strip().lower() for s in str(job.get("Skills", "")).split(",") if s.strip()]
    job_interests = [i.strip().lower() for i in str(job.get("Interests", "")).split(",") if i.strip()]
    job_loc = str(job.get("location", "")).lower().strip()
    
    # FIX: Correctly split user skills and interests by comma
    user_skills = [s.strip().lower() for s in user["skills"].split(",")]
    user_interests = [i.strip().lower() for i in user["interests"].split(",")]
    
    # Skill matching
    skill_matches = sum(1 for us in user_skills for js in job_skills if us in js)
    skills_ratio = skill_matches / max(1, len(job_skills)) if job_skills else 0
    
    # Interest matching
    interest_matches = sum(1 for ui in user_interests for ji in job_interests if ui in ji)
    interests_ratio = interest_matches / max(1, len(job_interests)) if job_interests else 0
    
    # Location matching
    user_loc = user["location"].replace(" ", "").lower()
    location_score = 100 if user_loc in job_loc else 0
    
    # Confidence Score
    confidence_score = (skills_ratio * 0.5 + interests_ratio * 0.3) * 100 + location_score * 0.2

    # Reason string
    reason = f"Matched {skills_ratio*100:.0f}% skills, {interests_ratio*100:.0f}% interests, location score {location_score:.0f}%."

    return confidence_score, reason

# --- Routes ---
@app.route("/")
def index():
    return send_from_directory('.', 'index.html')

@app.route("/match", methods=["POST"])
def match():
    try:
        data = request.json
        user_input = {
            "skills": data["skills"],
            "interests": data["interests"],
            "location": data["location"]
        }
        
        # Load the internships data
        internships_df = pd.read_csv(CSV_FILE)
        
        suggestions = []
        for _, row in internships_df.iterrows():
            conf, reason = compute_score(user_input, row)
            
            if conf > 50: # Adjust the threshold as needed
                suggestions.append({
                    "title": row.get("internship_title", ""),
                    "company": row.get("company_name", ""),
                    "location": row.get("location", ""),
                    "stipend": row.get("stipend", ""),
                    "Skills": row.get("Skills", ""),
                    "Interests": row.get("Interests", ""),
                    "confidence": conf,
                    "reason": reason
                })

        training_stats["total_shown"] += len(suggestions)
        suggestions.sort(key=lambda x: x["confidence"], reverse=True)

        return jsonify(suggestions[:10])

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# --- Accept internship for training ---
@app.route("/accept", methods=["POST"])
def accept():
    data = request.json
    file_exists = os.path.isfile(ACCEPTED_FILE)
    
    with open(ACCEPTED_FILE, "a", newline="", encoding="utf-8") as f:
        # FIX: Use a fixed list of fieldnames to prevent header duplication
        writer = csv.DictWriter(f, fieldnames=ACCEPTED_FIELDNAMES, quoting=csv.QUOTE_ALL)
        
        # Check if the file is empty before writing the header
        if not file_exists or f.tell() == 0:
            writer.writeheader()
        
        writer.writerow(data)
        
    training_stats["accepted"] += 1
    return jsonify({"status": "success"})

# --- Accuracy route ---
@app.route("/accuracy", methods=["GET"])
def accuracy():
    total = training_stats["total_shown"]
    accepted = training_stats["accepted"]
    accuracy_percent = (accepted / total * 100) if total > 0 else 0
    return jsonify({"total_shown": total, "accepted": accepted, "accuracy_percent": accuracy_percent})


# --- The key addition to make the app runnable ---
if __name__ == "__main__":
    app.run(debug=True)