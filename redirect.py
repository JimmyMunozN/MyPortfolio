from flask import Flask, render_template, send_from_directory
import os
from dotenv import load_dotenv

if os.path.exists('/etc/secrets/.env'):
    load_dotenv('/etc/secrets/.env')
else:
    load_dotenv()

app = Flask(__name__, 
            static_folder='static',
            static_url_path='/static',
            template_folder='templates')

@app.route('/')
def inicio():
    return render_template('main.html', initial_content_template='start.html')

@app.route('/get-content/<page_name>')
def get_content(page_name):
    if page_name in ['start', 'home', 'about', 'projects', 'contact']:
        return render_template(f'{page_name}.html')
    return "Contenido no encontrado", 404


@app.route('/downloadCV')
def downloadCV():
    directory = app.root_path + '/static/downloads/'

    filename = 'JimmyMunoz_CV.pdf'
    
    download_name = 'CV_JimmyMuñoz_JuniorDeveloper.pdf'

    return send_from_directory(
        directory,
        filename,
        as_attachment=True,
        download_name=download_name
    )

app = app

if __name__ == '__main__':
    app.run(debug=True)
