#include<bits/stdc++.h>
using namespace std;

void travelingsalesman( int V, vector<vector<int>>& graph, int src) {
    vector<int> vertices;
    for (int i = 0; i < V; i++) {
        if (i != src) {
            vertices.push_back(i);
        }
    }

    int min_path = INT_MAX;
    do {
        int current_pathweight = 0;
        int k = src;

        for (int i = 0; i < vertices.size(); i++) {
            current_pathweight += graph[k][vertices[i]];
            k = vertices[i];
        }
        current_pathweight += graph[k][src];

        min_path = min(min_path, current_pathweight);
    } while (next_permutation(vertices.begin(), vertices.end()));

    cout << "Minimum cost of traveling salesman: " << min_path << endl;
}   