#include<bits/stdc++.h>
using namespace std;

void bellmanford(int V, vector<vector<int>>& edges, int src) {
    vector<int> dist(V, INT_MAX);
    dist[src] = 0;

    for (int i = 1; i <= V - 1; i++) {
        for (auto edge : edges) {
            int u = edge[0];
            int v = edge[1];
            int weight = edge[2];

            if (dist[u] != INT_MAX && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
            }
        }
    }

    for (auto edge : edges) {
        int u = edge[0];
        int v = edge[1];
        int weight = edge[2];

        if (dist[u] != INT_MAX && dist[u] + weight < dist[v]) {
            cout << "Graph contains negative weight cycle" << endl;
            return;
        }
    }

    cout << "Vertex Distance from Source" << endl;
    for (int i = 0; i < V; i++) {
        cout << i << "\t\t" << dist[i] << endl;
    }
}