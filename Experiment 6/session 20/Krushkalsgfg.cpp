class Solution
{
    public:
    
    int find(int x, vector<int>& parent)
    {
        if(parent[x] == x)
            return x;
        return parent[x] = find(parent[x], parent);
    }
    
    void unite(int x, int y, vector<int>& parent, vector<int>& rankv)
    {
        int px = find(x, parent);
        int py = find(y, parent);
        
        if(px == py) return;
        
        if(rankv[px] > rankv[py])
            parent[py] = px;
        else if(rankv[px] < rankv[py])
            parent[px] = py;
        else
        {
            parent[py] = px;
            rankv[px]++;
        }
    }
    
    int spanningTree(int V, vector<vector<int>> edges)
    {
        sort(edges.begin(), edges.end(), [](vector<int>& a, vector<int>& b){
            return a[2] < b[2];
        });
        
        vector<int> parent(V), rankv(V, 0);
        for(int i = 0; i < V; i++)
            parent[i] = i;
            
        int sum = 0;
        
        for(auto &e : edges)
        {
            int u = e[0];
            int v = e[1];
            int w = e[2];
            
            if(find(u, parent) != find(v, parent))
            {
                sum += w;
                unite(u, v, parent, rankv);
            }
        }
        
        return sum;
    }
};
