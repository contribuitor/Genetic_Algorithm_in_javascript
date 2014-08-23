##前言
  数学建模使用到过，当时只知道可以用来求解优化问题，最近对人工智能甚有好感，学习过程中又一次见面，准备做一些与人工智能相关的js网页，演示人工智能的威力。一切从遗传算法开始！！！

##遗传算法（参考http://www.ai-junkie.com/ga/intro/gat2.html ）
  为了使用遗传算法解决一个问题，
  
  第一步是对问题的解进行编码（类比基因），通常编码成01信息  010001010101...
  
  第二步是随机产生N个“基因”，放到"基因库（pool）中"(有两个基因库，一个是自然选择出来存活下来的基因库)
  
  第三步是定义一个适应函数（fitness score），用来判断基因解决问题的适合程度
  
  然后重复以下步骤直到得到想要的结果：
  
    1.从基因库中选出两个基因，每条基因被选中的概率取决于适应函数的值
    2.根据交叉概率（crossover rate）（一般取0.7）交叉选中的两条基因中的bit信息
    3.根据突变概率（mutation rate）（通常取很小，不如0.001）改变基因中bit信息
    4.检查两条基因是否满足条件，若满足，结束程序。否则将两条基因放入“新基因库”
    5.重复以上步骤直到产生一群新的基因库，抛弃原来的基因库，将新基因库作为“基因库”（每次形成一个新的基因库叫做一个generation）
    

##注：
  crossover过程：随机取基因中一个位置，交换该位置之后的信息
  
  mutation过程：比特信息flip一下（0变1,1变0）

##例子：

用"0-9,+,-,*,/" 这些算符表示某个数。运算规则是从左向右，忽略算符的优先级
  
比如：23 = 6 + 5 * 4 / 2; 75.5 = 5 /2 + 9 * 7 - 5. 

####第一步：编码

0:         0000; 
1:         0001; 
2:         0010; 
3:         0011;  
4:         0100; 
5:         0101; 
6:         0110; 
7:         0111; 
8:         1000; 
9:         1001; 
+:         1010; 
-:         1011; 
*:         1100; 
/:         1101; 

比如：
0110 1010 0101 1100 0100 1101 0010 1010 0001 代表
 
6        +        5        *        4         /        2        +       1

如果遇到1110和1111（没用到的），忽略之。

如果遇到

0010 0010 1010 1110 1011 0111 0010
 
2        2        +        n/a     -        7        2

这种情况，忽略不符合规则的部分，规则为：数字->算符->数字->算符->...
因此，以上信息转化为：

  2 + 7
  
####第二步：构造适应函数（fitness function）
这里用信息解码出来，计算得到的值与目标值得差的倒数作为适应函数。因为差距越小适应度越高
（当然，也可以用其他方式）

例如：011010100101110001001101001010100001
 
适应度为： 1/(42-23) 或者说 1/19.

当被除数为0时，说明我们找到了结果。

###参考java程序（by Tim Roberts）

import java.util.*;

public class GA {
	
	public static void main(String[] args)  {
		new GA().doIt(Integer.parseInt(args[0]));

	}
	
	// Static info
	static char[] ltable = {'0','1','2','3','4','5','6','7','8','9','+','-','*','/'};
	static int chromoLen = 5;
	static double crossRate = .7;
	static double mutRate = .001;
	static Random rand = new Random();
	static int poolSize = 40;	// Must be even
		

	private void doIt(int target) {

		int gen=0;		

		// Create the pool
		ArrayList pool = new ArrayList(poolSize);
		ArrayList newPool = new ArrayList(pool.size());
		
		// Generate unique cromosomes in the pool
		for (int x=0;x<poolSize;x++) pool.add(new Chomosone(target));

		// Loop until solution is found
		while(true) {
			// Clear the new pool
			newPool.clear();
			
			// Add to the generations
			gen++;
			
			// Loop until the pool has been processed
			for(int x=pool.size()-1;x>=0;x-=2) {
				// Select two members
				Chomosone n1 = selectMember(pool);
				Chomosone n2 = selectMember(pool);
				
				// Cross over and mutate
				n1.crossOver(n2);
				n1.mutate();
				n2.mutate();
				
				// Rescore the nodes
				n1.scoreChromo(target);
				n2.scoreChromo(target);
				
				// Check to see if either is the solution
				if (n1.total == target && n1.isValid()) { System.out.println("Generations: " + gen + "  Solution: " + n1.decodeChromo()); return; }
				if (n2.total == target && n2.isValid()) { System.out.println("Generations: " + gen + "  Solution: " + n2.decodeChromo()); return; }
				
				// Add to the new pool
				newPool.add(n1);
				newPool.add(n2);
			}
			
			// Add the newPool back to the old pool
			pool.addAll(newPool);
		}
						
	}		


	//---- Chomosone Class -----
	private Chomosone selectMember(ArrayList l) { 

		// Get the total fitness		
		double tot=0.0;
		for (int x=l.size()-1;x>=0;x--) {
			double score = ((Chomosone)l.get(x)).score;
			tot+=score;
		}
		double slice = tot*rand.nextDouble();
		
		// Loop to find the node
		double ttot=0.0;
		for (int x=l.size()-1;x>=0;x--) {
			Chomosone node = (Chomosone)l.get(x);
			ttot+=node.score;
			if (ttot>=slice) { l.remove(x); return node; }
		}
		
		return (Chomosone)l.remove(l.size()-1);
	}
	
	// Genetic Algorithm Node
	private static class Chomosone {
		// The chromo
		StringBuffer chromo		  = new StringBuffer(chromoLen * 4);
		public StringBuffer decodeChromo = new StringBuffer(chromoLen * 4);
		public double score;
		public int total;
		
		// Constructor that generates a random
		public Chomosone(int target) {
			
			// Create the full buffer
			for(int y=0;y<chromoLen;y++) {
				// What's the current length
				int pos = chromo.length();
				
				// Generate a random binary integer
				String binString = Integer.toBinaryString(rand.nextInt(ltable.length));
				int fillLen = 4 - binString.length();
				
				// Fill to 4
				for (int x=0;x<fillLen;x++) chromo.append('0');
				
				// Append the chromo
				chromo.append(binString);
				
			}
			
			// Score the new cromo
			scoreChromo(target);
		}
					
		public Chomosone(StringBuffer chromo) { this.chromo = chromo; }
		
		// Decode the string
		public final String decodeChromo() {	

			// Create a buffer
			decodeChromo.setLength(0);
			
			// Loop throught the chromo
			for (int x=0;x<chromo.length();x+=4) {
				// Get the
				int idx = Integer.parseInt(chromo.substring(x,x+4), 2);
				if (idx<ltable.length) decodeChromo.append(ltable[idx]);
			}
			
			// Return the string
			return decodeChromo.toString();
		}
		
		// Scores this chromo
		public final void scoreChromo(int target) {
			total = addUp();
			if (total == target) score = 0;
			score = (double)1 / (target - total);
		}
		
		// Crossover bits
		public final void crossOver(Chomosone other) {

			// Should we cross over?
			if (rand.nextDouble() > crossRate) return;
			
			// Generate a random position
			int pos = rand.nextInt(chromo.length());
			
			// Swap all chars after that position
			for (int x=pos;x<chromo.length();x++) {
				// Get our character
				char tmp = chromo.charAt(x);
				
				// Swap the chars
				chromo.setCharAt(x, other.chromo.charAt(x));
				other.chromo.setCharAt(x, tmp);
			}
		}
			
		// Mutation
		public final void mutate() {
			for (int x=0;x<chromo.length();x++) {
				if (rand.nextDouble()<=mutRate) 
					chromo.setCharAt(x, (chromo.charAt(x)=='0' ? '1' : '0'));
			}
		}
			
		
				
		// Add up the contents of the decoded chromo
		public final int addUp() { 
		
			// Decode our chromo
			String decodedString = decodeChromo();
			
			// Total
			int tot = 0;
			
			// Find the first number
			int ptr = 0;
			while (ptr<decodedString.length()) { 
				char ch = decodedString.charAt(ptr);
				if (Character.isDigit(ch)) {
					tot=ch-'0';
					ptr++;
					break;
				} else {
					ptr++;
				}
			}
			
			// If no numbers found, return
			if (ptr==decodedString.length()) return 0;
			
			// Loop processing the rest
			boolean num = false;
			char oper=' ';
			while (ptr<decodedString.length()) {
				// Get the character
				char ch = decodedString.charAt(ptr);
				
				// Is it what we expect, if not - skip
				if (num && !Character.isDigit(ch)) {ptr++;continue;}
				if (!num && Character.isDigit(ch)) {ptr++;continue;}
			
				// Is it a number
				if (num) { 
					switch (oper) {
						case '+' : { tot+=(ch-'0'); break; }
						case '-' : { tot-=(ch-'0'); break; }
						case '*' : { tot*=(ch-'0'); break; }
						case '/' : { if (ch!='0') tot/=(ch-'0'); break; }
					}
				} else {
					oper = ch;
				}			
				
				// Go to next character
				ptr++;
				num=!num;
			}
			
			return tot;
		}

		public final boolean isValid() { 
		
			// Decode our chromo
			String decodedString = decodeChromo();
			
			boolean num = true;
			for (int x=0;x<decodedString.length();x++) {
				char ch = decodedString.charAt(x);

				// Did we follow the num-oper-num-oper-num patter
				if (num == !Character.isDigit(ch)) return false;
				
				// Don't allow divide by zero
				if (x>0 && ch=='0' && decodedString.charAt(x-1)=='/') return false;
				
				num = !num;
			}
			
			// Can't end in an operator
			if (!Character.isDigit(decodedString.charAt(decodedString.length()-1))) return false;
			
			return true;
		}
	}
}



















