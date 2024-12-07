You can test and run the python code on collab and test things easily by just running it.
Collab Link:

However if you want to run the Website which is implemented you need to the following commands: (Make sure you have Python, pip, Node installed)

1. In console, navigate to the backend folder
2. Type .\venv\Scripts\activate for Windows, and source venv/bin/activate for Mac
3. Type pip install flask flask-cors tensorflow opencv-python-headless numpy pillow scikit-learn
4. Type python app.py to start the backend
5. In console, navigate to the brain-tumor-ui folder
6. Type npm install
7. Type npm start to start the frontend
8. Now you can upload an image of a MRI Brain scan and see if any of the tumors are detected (There are Testing images in the backend folder if needed )
