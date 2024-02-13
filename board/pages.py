from flask import Blueprint, render_template, request, jsonify
from board import flag_search
import pandas as pd
import numpy as np
import pyodbc

bp = Blueprint("pages", __name__)
df = pd.read_pickle("data/course_catalog_final.pkl")

@bp.route("/")
def home():
    return render_template("pages/home.html")

@bp.route("/feedback")
def feedback():
    return render_template("pages/feedback.html")

@bp.route("/about")
def about():
    return render_template("pages/about.html")

@bp.route('/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query')
    springOnly = data.get('springOnly')
    upper_div = data.get('upperDivision')
    lower_div = data.get('lowerDivision')
    graduate = data.get('graduate')
    include = data.get('include')
    exclude = data.get('exclude')
    k = data.get('k')

    # performing search
    data = flag_search.filter(df, springOnly, upper_div, lower_div, graduate, include, exclude)
    # results = embedding_search.emb_search(query, k, data)
    results = flag_search.search(query, data, k)
    # results = course_search.es_search(query, upper_div, lower_div, graduate, include, exclude, k)

    return jsonify(results)

server = 'ucs-feedback.database.windows.net'
database = 'search-feedback'
username = 'mfrankne'
password = 'ucsd-course-search9'
driver= '{ODBC Driver 18 for SQL Server}'

@bp.route('/log-feedback', methods=['POST'])
def log_feedback():
    data = request.json
    # Update the connection string as per your Azure SQL Database details
    conn_str = 'DRIVER={your_driver};SERVER=tcp:your_server,1433;DATABASE=your_database;UID=your_username;PWD=your_password;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;'
    sql = """INSERT INTO FeedbackLog (Query, ClassCode, ClassTitle, NumberOfResults, SpringOnly, UpperDivision, LowerDivision, Graduate, Include, Exclude, ButtonType, Timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())"""
    try:
        with pyodbc.connect(conn_str) as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, (data['Query'], data['ClassCode'], data['ClassTitle'], data['NumberOfResults'], 
                                     data['SpringOnly'], data['UpperDivision'], data['LowerDivision'], data['Graduate'], 
                                     data['Include'], data['Exclude'], data['ButtonType']))
                conn.commit()
        return jsonify({'status': 'success', 'message': 'Feedback logged'})
    except Exception as e:
        print(str(e))
        return jsonify({'status': 'error', 'message': 'Failed to log feedback'}), 500