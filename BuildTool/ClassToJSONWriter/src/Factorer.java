
public class Factorer {

	public static void main(String[] args) {
		System.out.println(factors(10));
	}
	
	public static int factors(int n) {
		if(n <= 1) {
			return 0;
		} else {
			int amount = 0;
			for(int i = 1; i < n; i++) {
				if(n % (n-i) == 0) {
					amount++;
					amount += factors(n % (n-i));
				}
			}
			return amount;
		}
	}

}
