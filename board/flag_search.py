from FlagEmbedding import FlagModel

import numpy as np
import pandas as pd
import heapq
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

nltk.download('stopwords')
# loading model
model = FlagModel('BAAI/bge-small-en-v1.5', 
                query_instruction_for_retrieval="Represent this sentence for searching relevant passages: ",
                use_fp16=True) # Setting use_fp16 to True speeds up computation with a slight performance degradation;
    

def filter(df, upper_div, lower_div, graduate, include, exclude):
    """
    Optimized filter function for a DataFrame based on level of study and department inclusion/exclusion.

    Parameters:
    - df: DataFrame to filter.
    - upper_div: Boolean, True to include Upper Division levels.
    - lower_div: Boolean, True to include Lower Division levels.
    - graduate: Boolean, True to include Graduate levels.
    - include: List of departments to include.
    - exclude: List of departments to exclude.

    Returns:
    - Optimized filtered DataFrame based on the specified criteria.
    """
    # Create a boolean series for each level condition
    conditions = pd.Series(False, index=df.index)
    if upper_div:
        conditions |= (df['Level'] == 'Upper Division')
    if lower_div:
        conditions |= (df['Level'] == 'Lower Division')
    if graduate:
        conditions |= (df['Level'] == 'Graduate')
    
    # Apply level filtering
    df = df[conditions]
    
    # Apply department inclusion and exclusion
    if include:
        df = df[df['Department'].isin(include)]
    if exclude:
        df = df[~df['Department'].isin(exclude)]
    
    # Reset index
    df = df.reset_index(drop=True)
    return df
 
def preprocess_and_embed(text):
     # Convert to lowercase
    text = text.lower()
    
    # Tokenizes text
    tokens = re.split(r'[^a-zA-Z0-9]+', text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [token for token in tokens if token not in stop_words]
    
    # Lemmatize
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    
    preprocessed_text = ' '.join(tokens)
    return model.encode_queries(preprocessed_text)

def cosine_similarity(vec1, vec2):
    """
    Computes the cosine similarity between two vectors
    """
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def search(query, data, k):
    """
    Computes the embedding of the query and retrieves the k most similar documents
    """
    k = int(k)
    title_embeddings = data['Title Embeddings']
    desc_embeddings = data['Description Embeddings']

    # gets the embedding of the query
    query_embedding = preprocess_and_embed(query)
    
    # get the similarities between the query embedding and the title embeddings
    title_similarities = np.array([cosine_similarity(query_embedding, doc_emb) for doc_emb in title_embeddings])
    
    # get the similarities between the query embedding and the description embeddings
    desc_similarities = np.array([cosine_similarity(query_embedding, doc_emb) for doc_emb in desc_embeddings])
    
    # weight the title and description similarities (weights should add up to 1) and calculate total similarity
    title_weight = 0.7
    desc_weight = 0.3
    similarities = (title_similarities * title_weight) + (desc_similarities * desc_weight)
    
    # ranks similarities by most similar to query embedding
    index_similarity_pair_ranked =  heapq.nlargest(k, enumerate(similarities), key=lambda x: x[1])
    print(len(index_similarity_pair_ranked))
    
    ranked_docs = []
    for ind, sim in index_similarity_pair_ranked:
        # don't include results that have similarity score < 0.7 unless it's the top result
        if sim < 0.7 and ranked_docs: break
        # grab the course code, the course title, and the similarity score
        ranked_docs.append((data['Code'][ind], data['Title'][ind],  data['Description'][ind],  data['Prerequisites'][ind]))
    
    return ranked_docs
