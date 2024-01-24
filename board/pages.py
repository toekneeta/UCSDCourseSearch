from flask import Blueprint, render_template, request, jsonify
from board import course_search

bp = Blueprint("pages", __name__)

@bp.route("/")
def home():
    return render_template("pages/home.html")

@bp.route('/search', methods=['POST'])
def search():
    query = request.json.get('query')
    results = course_search.es_search(query)
    return jsonify(results)
