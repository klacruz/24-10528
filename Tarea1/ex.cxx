#include <vector>
#include <numeric>   
#include <cmath>     
#include <algorithm>
#include <iostream>
#include <stream>

using namespace std;

int main(){
  return 0;
}

double mean(vector<double> v){
    if (v.empty()) return 0.0;  
    double sum = 0.0;
    for(double x:v){
        sum += x;
    }
    return sum / v.size();
}

double variance(vector<double> v){
    int n = v.size();
    if (n < 2) return 0.0;      
    double sum = 0.0;
    double sum_sq = 0.0;

    for (double x : v){
        sum    += x;
        sum_sq += x * x;
    }
    return(sum_sq − (sum ∗ sum) / (double) n)/ (n − 1);
} 
int main() {
    // Aquí puedes agregar código para probar tus funciones más adelante
    int n;
    cout << "¿Cuántos números quieres ingresar?: ";
    cin >> n;

    vector<double> datos(n);
    for(int i = 0; i < n; i++) {
        cout << "Número " << i + 1 << ": ";
        cin >> datos[i];
    }

    cout << "Promedio: " << mean(datos) << endl;
    cout << "Varianza: " << variance(datos) << endl;

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
  }
    if (den_A == 0 || den_B == 0) return 0.0;
    return num / sqrt(den_A * den_B);
}

int to_decimal(vector<char> s, int base) {
    int res = 0;
    for (char c : s) {
        int v = (c >= 'A') ? (c - 'A' + 10) : (c - '0');
        res = res * base + v;
    }
    return res;
}

vector<char> from_decimal(int n, int base) {
    if (n == 0) return {'0'};
    vector<char> res;
    string chars = "0123456789ABCDEF";
    while (n > 0) {
        res.push_back(chars[n % base]);
        n /= base;
    }
    reverse(res.begin(), res.end());
    return res;
}
vector<char> dec_to_septapus(int n){return from_decimal(n, 7); }
vector<char> dec_to_octopus(int n){ return from_decimal(n, 8); }
vector<char> dec_to_hexakaidecapus(int n){ return from_decimal(n, 16); }
vector<char> septapus_to_dec(vector<char> s){ return from_decimal(to_decimal(s, 7), 10); }
vector<char> octopus_to_dec(vector<char> s){ return from_decimal(to_decimal(s, 8), 10); }
vector<char> hexakaidecapus_to_dec(vector<char> s){ return from_decimal(to_decimal(s, 16), 10); }
vector<char> septapus_to_octopus(vector<char> s){ return from_decimal(to_decimal(s, 7), 8); }
vector<char> septapus_to_hexakaidecapus(vector<char> s){ return from_decimal(to_decimal(s, 7), 16); }
vector<char> octapus_to_septapus(vector<char> s){ return from_decimal(to_decimal(s, 8), 7); }
vector<char> octopus_to_hexakaidecapus(vector<char> s){ return from_decimal(to_decimal(s, 8), 16); } 
vector<char> hexakaidecapus_to_septapus(vector<char> s){ return from_decimal(to_decimal(s, 16), 7); }
vector<char> hexakaidecapus_to_octopus(vector<char> s){ return from_decimal(to_decimal(s, 16), 8); }
}
