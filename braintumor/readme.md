You can test and run the python code on collab and test things easily by just running it. The .ipynb file is in the braintumor folder.

### Collab Link: https://colab.research.google.com/drive/1abOb7aTqQQCWcrSPv3MPyFBzSV4pCGhc?usp=sharing

### Slides Link: https://docs.google.com/presentation/d/138S2u7wJsHLTVCQK5n43KuttB93SK-EtqhFkGqTB_HA/edit?usp=sharing

### Report Link: https://docs.google.com/document/d/1SY0MA-L_Ed2CkkU5IyM6ksiupZL1_yJyx39A79fEb8E/edit?usp=sharing

However if you want to run the Website which is implemented you need to the following commands: (Make sure you have Python, npm, Node, git installed)
git clone https://github.com/nikhilkhanchandani/projects/tree/main/braintumor

1. In console, navigate to the backend folder
2. Type .\venv\Scripts\activate for Windows, and source venv/bin/activate for Mac
3. Type pip install flask flask-cors tensorflow opencv-python-headless numpy pillow scikit-learn
4. Type python app.py to start the backend
5. In console, navigate to the brain-tumor-ui folder
6. Type npm install
7. Type npm start to start the frontend
8. Now you can upload an image of a MRI Brain scan and see if any of the tumors are detected (There are Testing images in the backend folder if needed )
