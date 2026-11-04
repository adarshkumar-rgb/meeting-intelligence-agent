
from gemini_service import analyze_meeting


sample_transcript = """
Asha: We need to finish the website dashboard by Friday.
Rahul: I'll complete the charts by Wednesday.
Asha: I'll review the dashboard on Thursday.
Rahul: We should also discuss mobile responsiveness
in our next meeting.
"""

result = analyze_meeting(sample_transcript)

print("MEETING ANALYSIS")
print("=" * 40)
print(result)
