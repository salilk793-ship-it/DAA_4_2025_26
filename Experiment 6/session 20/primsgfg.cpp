class Solution
{
    public:
    
    int spanningTree(int V, vector<vector<int>> edges)
    {
        vector<vector<pair<int,int>>> adj(V);
        
        for(auto &e : edges)
        {
            int u = e[0];
            int v = e[1];
            int w = e[2];
            
            adj[u].push_back({v, w});
            adj[v].push_back({u, w});
        }
        
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
        vector<int> key(V, INT_MAX);
        vector<bool> inMST(V, false);
        
        pq.push({0, 0});
        key[0] = 0;
        
        int sum = 0;
        
        while(!pq.empty())
        {
            int u = pq.top().second;
            int wt = pq.top().first;
            pq.pop();
            
            if(inMST[u]) continue;
            
            inMST[u] = true;
            sum += wt;
            
            for(auto &it : adj[u])
            {
                int v = it.first;
                int weight = it.second;
                
                if(!inMST[v] && weight < key[v])
                {
                    key[v] = weight;
                    pq.push({weight, v});
                }
            }
        }
        
        return sum;
    }
};
