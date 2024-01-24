import pandas as pd
import numpy as np
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

course_info = pd.read_csv('data/course_catalog.csv')
course_info = course_info.drop(course_info.columns[0], axis=1)
course_info = course_info.astype(str)
course_info = course_info.drop_duplicates()

es = Elasticsearch("http://localhost:9200")
mappings = {
    "properties": {
        'Code': {"type": "text"}, 
        'Department': {"type": "text"}, 
        'Title': {"type": "text"}, 
        'Units': {"type": "text"}, 
        'Description': {"type": "text"}, 
        'Prerequisites': {"type": "text"}, 
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
                'Prerequisites': row['Prerequisites']
            }
        }
    )

bulk(es, bulk_data)

def es_search(query, k=10):
    """
    Searches the data using ElasticSearch to find the k most similar documents to the query.
    Returns a list of the k most similar functions, along with their GitHub URLs and their similarity scores to the query
    """

    es_query = {
        "query": {
            "bool": {
                "must": {
                    "query_string": {
                        "query": query,
                        "fields": [
                            'Code',
                            'Department',
                            'Title^1.5',
                            'Description^2', #boost 2x
                            'Prerequisites'
                        ],
                        "phrase_slop": 2  # still considered a match if they are up to two terms apart
                    }
                },
            }
        },
        "size": k
    }
    
    response = es.search(index="courses", body=es_query)
    
    results = []
    # for each result, add the function name, the GitHub URL of the function, and the similarity score to the results list
    for hit in response['hits']['hits']:
        row = hit['_source']
        results.append((row['Code'], row['Title'], row['Description']))
        
    return results