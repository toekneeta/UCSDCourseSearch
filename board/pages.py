from flask import Blueprint, render_template, request, jsonify
from board import course_search

bp = Blueprint("pages", __name__)

@bp.route("/")
def home():
    return render_template("pages/home.html")

# @bp.route('/search', methods=['POST'])
# def search():
#     query = request.json.get('query')
#     results = course_search.es_search(query)
#     return jsonify(results)

@bp.route('/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query')
    upper_div = data.get('upperDivision')
    lower_div = data.get('lowerDivision')
    graduate = data.get('graduate')
    include = data.get('include')
    exclude = data.get('exclude')
    k = data.get('k')

    # Now, perform your Elasticsearch query with additional filter parameters
    results = course_search.es_search(query, upper_div, lower_div, graduate, include, exclude, k)

    return jsonify(results)