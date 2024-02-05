from flask import Blueprint, render_template, request, jsonify
# from board import embedding_search
from board import flag_search
import pandas as pd
import numpy as np

bp = Blueprint("pages", __name__)
df = pd.read_pickle("data/course_catalog_with_flag_embeddings.pkl")

@bp.route("/")
def home():
    return render_template("pages/home.html")

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

    # performing search
    data = flag_search.filter(df, upper_div, lower_div, graduate, include, exclude)
    # results = embedding_search.emb_search(query, k, data)
    results = flag_search.search(query, data, k)
    # results = course_search.es_search(query, upper_div, lower_div, graduate, include, exclude, k)

    return jsonify(results)