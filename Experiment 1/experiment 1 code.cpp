//24BCS125
//time complexity = O(nlog(base2)3)
//recurrence reln= 3T(n/2)+nlogn

#include <bits/stdc++.h>
using namespace std;


int complexRec(int n,int &dpt) {
int cntr=0;
   if (n <= 2) {
       dpt=1;
       return 1;
   }


   int p = n;
   while (p > 0) {
       vector<int> temp(n);
       for (int i = 0; i < n; i++) {
           temp[i] = i ^ p;
           cntr++;
       }
       p >>= 1;
   }


   vector<int> small(n);
   for (int i = 0; i < n; i++) {
       small[i] = i * i;
       cntr++;
   }


   if (n % 3 == 0) {
       reverse(small.begin(), small.end());
   } else {
       reverse(small.begin(), small.end());
   }
   
   int d1,d2,d3;
   cntr+=complexRec(n / 2,d1);
   cntr+=complexRec(n / 2,d2);
   cntr+=complexRec(n / 2,d3);
   dpt=1+max({d1,d2,d3});
   return cntr;
}
int main(){
    auto start = std::chrono::steady_clock::now();

    auto end = std::chrono::steady_clock::now();

    auto dur = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

    std::cout << dur.count() << " milliseconds" << std::endl;
    int dpt;
    cout<<"iterations:"<<complexRec(8,dpt)<<endl;
    cout<<"depth:"<<dpt<<endl;
    return 0;
}
