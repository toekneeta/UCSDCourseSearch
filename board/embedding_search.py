import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# df = pd.read_pickle("data/course_catalog_with_embeddings.pkl")

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
    
    return df

def cos_sim(q_tensor, tensor_dict):
    scores = {}
    for id, tensor in tensor_dict.items():
        magnitude_A = q_tensor.norm()
        magnitude_B = tensor.norm()
        similarity = torch.dot(q_tensor.squeeze(), tensor) / (magnitude_A * magnitude_B)
        # only output scores that are high enough
        if similarity >= 0.2:
            scores[id] = similarity.item()
    return scores

def emb_search(query, k, df):
    """
    Search for the top k most similar items in df to the query using cosine similarity.
    
    Parameters:
    - query: The search query string.
    
    Returns:
    Top k most similar items
    """
    model = SentenceTransformer('sentence-transformers/msmarco-distilbert-base-v4')

    # Encode the query to get the query embedding
    query_emb = model.encode(query)  # Assuming the model has an 'encode' method
    
    # Get the embeddings from the dataframe
    desc_emb_list = np.vstack(df['Description Embeddings'])
    title_emb_list = np.vstack(df['Title Embeddings'])
    
    # Calculate cosine similarities
    desc_similarities = cosine_similarity([query_emb], desc_emb_list)[0]
    title_similarities = cosine_similarity([query_emb], title_emb_list)[0]
    combined_similarities = desc_similarities + title_similarities
    
    # Get the indices of the top k most similar embeddings
    top_k_indices = np.argsort(combined_similarities)[-k:][::-1]

    # Return the top k most similar items from df
    top_k_results = df.iloc[top_k_indices][['Code', 'Department', 'Title', 'Description', 'Prerequisites', 'URL']]

    return top_k_results.to_numpy()
