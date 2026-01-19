//Leetcode 141
class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode* slow=head;
        ListNode* fast=head;
        while(fast!=nullptr && fast->next!=nullptr){
            slow=slow->next;
            fast=fast->next->next;
            if(slow==fast){
                return true;
            }

        }
            return false;     
    }
};

//leetcode 206
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        if(!head) return nullptr;
        int n=0;
        ListNode* temp=head;
        while(temp!=nullptr){
            n++;
            temp=temp->next;
        }
        vector<int> arr(n);
        temp=head;
    int i=0;
    while(temp!=nullptr){
            arr[i]=temp->val;
             temp=temp->next;
            i++;
        }
        temp=head;
        for(int i=n-1;i>=0;i--){
            temp->val=arr[i];
            temp=temp->next;
        }
        return head;
    }
};

//leetcode 142
class Solution {
public:
    ListNode *detectCycle(ListNode *head) {
        ListNode *slow=head;
        ListNode *fast=head;
        while(fast &&fast->next){
            slow=slow->next;
            fast=fast->next->next;
            if(slow==fast)
            break;    
        }
        if(!fast||!fast->next) return nullptr;
        slow=head;
        while(slow!=fast){
            slow=slow->next;
            fast=fast->next;
        }
        return slow;    
    }
};
