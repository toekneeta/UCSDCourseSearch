---
layout: default
title: UCSDCourseSearch
---

# Welcome to UCSDCourseSearch!

- [UCSDCourseSearch Website](http://ucsd-course-search.westus2.azurecontainer.io:8000/)
- [GitHub Repository](https://github.com/toekneeta/UCSDCourseSearch/tree/main)
- [Report](https://drive.google.com/file/d/16Lpo-LVNT5qIltTENZE-W6WIUBD6ONvk/view?usp=sharing)
- [Poster](https://drive.google.com/file/d/1-Zt_e3IzYvBw3QLgD0F0rvuvow68wsTe/view?usp=sharing)

## Introduction

The **UCSDCourseSearch** project enables UCSD students to search for courses more conveniently. Our search engine improves on UCSD's WebReg search function, which is limited to only finding exact matches from an user's search query in course titles, using semantic search, a search technique that aims to understand the meaning and context of search queries to provide more relevant search results. This means that students no longer need to know the exact course name in order to search for it. Our search tool is able to understand the intent of the user's search queries and finds the most similar courses to them.


## How It Works

Our search engine uses the [UCSD course catalog](https://catalog.ucsd.edu/front/courses.html), which contains 7,169 courses across 173 departments, as its primary dataset and parses through these courses during the search process. Specifically, the course titles and descriptions are the documents that are being searched through. 

Using the [FlagModel BAAI/bge-small-en-v1.5 embedding model](https://huggingface.co/BAAI/bge-small-en-v1.5), the course titles and descriptions are embedded separately to create 2 sets of embeddings. These embeddings are numerical multi-dimensional vectors that represent the course titles and descriptions. The closer the distance between two vectors are to each other, the more similar they are.

The search process begins by processing the user's query along with other search parameters, such as filters and the desired number of results. Based on the user-specified filter criteria (*i.e. the user specifies they want to search for courses only in the DSC department*), irrelevant courses are discarded from the search process. The query is then embedded using the same FlagModel that is used to embed the course titles and descriptions.

To find the most relevant courses to the query, the search function employs cosine similarity between the query's embedding and the embeddings of the course title and description, separately. For each course, the similarity scores from the title and description are assigned weights and aggregated to calculate a final similarity score, with titles receiving a greater emphasis.

The final step involves returning and displaying the results on our website, with the quantity of displayed results being determined by the user's initial selection of the number of outcomes desired.

## Evaluating our Search Engine & What it Means

To evaluate our search, we created another search engine using ElasticSearch. This search engine doesn't employ semantic search, but instead uses a traditional keyword search. We also found another search function called [TritonSearch](https://tritonsearch.xyz/) made by a fellow UCSD student. We decided to compare the results of our search engine to both our baseline model and TritonSearch by using the search results of 145 queries to compute the [mean reciprocal rank (MRR)](https://www.evidentlyai.com/ranking-metrics/mean-reciprocal-rank-mrr), [normalized discounted cummulative gain (NDCG)](https://www.evidentlyai.com/ranking-metrics/ndcg-metric), and zero result rate (ZRR), which is the proportion of searches that yielded zero results, of all three search engines. The 145 queries used in our evaluation are sourced from the first 145 unique queries that UCSD students used since the website's launch.

| | Our Search| Baseline | TritonSearch
| ----------- | ----------- | ----------- | -----------|
| MRR | 0.9690 | 0.9345 | 0.7241
| NDCG| 0.9684 | 0.9404 | 0.7265
| ZRR | 0.0207 | 0.0219 | 0.2690

Our semantic search engine produced the best results in all three of the measured evaluation metrics when compared to the other search engines. The high MRR and NDCG scores show that our search engine generally ranked the most relevant results at the top of the list, while the low ZRR shows that our search engine showed relevant results for the majority of the queries in our test set. Overall, this shows that our search tool is capable of producing highly relevant results and is proficient at matching the correct courses to user queries.
