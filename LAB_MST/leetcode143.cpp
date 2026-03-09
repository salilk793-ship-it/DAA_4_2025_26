class Solution {
public:
    void reorderList(ListNode* head) {
        
        if(head==0){
            return;
        }
        stack<ListNode*> st;
        ListNode* temp= head;
        while(temp!=0){
            st.push(temp);
            temp=temp->next;
        }
        int n=st.size();
        temp=head;
        
        for(int i=0;i<n/2;i++){
            ListNode* last=st.top();
            st.pop();

            ListNode* nextnode=temp->next;
            temp->next=last;
            last->next=nextnode;
            temp=nextnode;

        }
         temp->next=NULL;

    }
};
