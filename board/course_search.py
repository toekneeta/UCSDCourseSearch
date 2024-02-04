import pandas as pd
import numpy as np
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

course_info = pd.read_csv('data/course_catalog.csv')
course_info = course_info.drop_duplicates()

es = Elasticsearch("http://localhost:9200")
mappings = {
    "properties": {
        'Code': {"type": "text"}, 
        'Department': {"type": "keyword"}, 
        'Title': {"type": "text"}, 
        'Units': {"type": "text"}, 
        'Description': {"type": "text"}, 
        'Prerequisites': {"type": "text"}, 
        'Level': {"type": "keyword"}, 
        'URL': {"type": "text"}, 
    }
}
try:
    es.indices.create(index="courses", mappings=mappings)
except:
    pass

bulk_data = []
for i, row in course_info.iterrows():
    bulk_data.append(
        {
            "_index": "courses",
            "_id": i,
            "_source": {
                "Code": row['Code'],
                'Department': row['Department'], 
                'Title': row['Title'], 
                'Units': row['Units'], 
                'Description': row['Description'], 
                'Prerequisites': row['Prerequisites'],
                'Level':row['Level'],
                'URL':row['URL'],
            }
        }
    )

bulk(es, bulk_data)

def es_search(query, upperdiv=True, lowerdiv=True, graduate=True, include='', exclude='', k=10):
    # Build the query
    must_clauses = [{
        "query_string": {
            "query": query,
            "fields": [
                'Code',
                'Department',
                'Title',
                'Description',
                'Prerequisites',
                'Level'
            ],
            "phrase_slop": 2
        }
    }]

    # Process include and exclude lists
    include_list = include.upper().replace(" ", "").split(',')
    exclude_list = exclude.upper().replace(" ", "").split(',')

    # Add department filters
    if include_list != ['']:
        must_clauses.append({"terms": {"Department": include_list}})
    
    must_not_clause = {"terms": {"Department": exclude_list}} if exclude_list != [''] else []

    # Initialize the 'should' clause for class level filters
    should_clauses = []
    if upperdiv:
        should_clauses.append({"match": {"Level": "Upper Division"}})
    if lowerdiv:
        should_clauses.append({"match": {"Level": "Lower Division"}})
    if graduate:
        should_clauses.append({"match": {"Level": "Graduate"}})

    # Build the final query
    es_query = {
        "query": {
            "bool": {
                "must": must_clauses,
                "should": should_clauses,
                "must_not": must_not_clause,
                "minimum_should_match": 1 if should_clauses else 0
            }
        },
        "size": k
    }

    response = es.search(index="courses", body=es_query)
    
    results = []
    for hit in response['hits']['hits']:
        row = hit['_source']
        results.append((row['Code'], row['Title'], row['Description'], row['Prerequisites']))
        
    return results
