#include <vector>

using namespace std;

int main(){
  return 0;
}

double mean(vector<double> v){
  if (v.empty()) return 0.0;
    double sum = accumulate(v.begin(), v.end(), 0.0);
    return sum / v.size();
  return 0;
}

double variance(vector<double> v){
  if (v.size() < 2) return 0.0;
    double m = mean(v);
    double accum = 0.0;
    for (double x : v) {
        accum += (x - m) * (x - m);
  return 0;
}

double pearson_r(vector<double> A, vector<double> B){
  if (A.size() != B.size() || A.empty()) return 0.0;

    int n = A.size();
    double sum_A = accumulate(A.begin(), A.end(), 0.0);
    double sum_B = accumulate(B.begin(), B.end(), 0.0);
    
    double mean_A = sum_A / n;
    double mean_B = sum_B / n;

    double num = 0.0;
    double den_A = 0.0;
    double den_B = 0.0;

    for (int i = 0; i < n; ++i) {
        double diff_A = A[i] - mean_A;
        double diff_B = B[i] - mean_B;
        num += diff_A * diff_B;
        den_A += diff_A * diff_A;
        den_B += diff_B * diff_B;
  return 0;
}

vector<char> dec_to_septapus(int n){return {};}
vector<char> dec_to_octopus(int n){return {};}
vector<char> dec_to_hexakaidecapus(int n){return {};}
vector<char> septapus_to_dec(vector<char> s){return {};}
vector<char> octopus_to_dec(vector<char> s){return {};}
vector<char> hexakaidecapus_to_dec(vector<char> s){return {};}
vector<char> septapus_to_octopus(vector<char> s){return {};}
vector<char> septapus_to_hexakaidecapus(vector<char> s){return {};}
vector<char> octapus_to_septapus(vector<char> s){return {};}
vector<char> octopus_to_hexakaidecapus(vector<char> s){return {};}
vector<char> hexakaidecapus_to_septapus(vector<char> s){return {};}
vector<char> hexakaidecapus_to_octopus(vector<char> s){return {};}
