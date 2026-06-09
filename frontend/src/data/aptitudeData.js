export const dsaTopics = [
  {
    id: "arrays",
    title: "Arrays",
    icon: "LayoutGrid",
    questions: [
      {
        id: "arr-1",
        title: "Two Sum",
        difficulty: "Easy",
        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        inputFormat: "First line: n (size of array)\nSecond line: n space-separated integers\nThird line: target integer",
        outputFormat: "Two space-separated indices (0-indexed)",
        constraints: "2 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9",
        sampleInput: "4\n2 7 11 15\n9",
        sampleOutput: "0 1",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1]."
      },
      {
        id: "arr-2",
        title: "Maximum Subarray Sum",
        difficulty: "Medium",
        statement: "Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.",
        inputFormat: "First line: n (size of array)\nSecond line: n space-separated integers",
        outputFormat: "Single integer - maximum subarray sum",
        constraints: "1 <= n <= 10^5\n-10^4 <= nums[i] <= 10^4",
        sampleInput: "9\n-2 1 -3 4 -1 2 1 -5 4",
        sampleOutput: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6."
      },
      {
        id: "arr-3",
        title: "Rotate Array",
        difficulty: "Medium",
        statement: "Given an integer array nums, rotate the array to the right by k steps, where k is non-negative.",
        inputFormat: "First line: n k (size and rotation steps)\nSecond line: n space-separated integers",
        outputFormat: "n space-separated integers after rotation",
        constraints: "1 <= n <= 10^5\n0 <= k <= 10^5",
        sampleInput: "7 3\n1 2 3 4 5 6 7",
        sampleOutput: "5 6 7 1 2 3 4",
        explanation: "Rotate right by 1: [7,1,2,3,4,5,6], by 2: [6,7,1,2,3,4,5], by 3: [5,6,7,1,2,3,4]"
      }
    ]
  },
  {
    id: "strings",
    title: "Strings",
    icon: "Type",
    questions: [
      {
        id: "str-1",
        title: "Reverse Words in a String",
        difficulty: "Medium",
        statement: "Given an input string s, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in s will be separated by at least one space. Return a string of the words in reverse order concatenated by a single space.",
        inputFormat: "Single line string",
        outputFormat: "Single line reversed string",
        constraints: "1 <= s.length <= 10^4\ns contains English letters, digits, and spaces",
        sampleInput: "the sky is blue",
        sampleOutput: "blue is sky the",
        explanation: "Words are reversed in order while maintaining individual word spelling."
      },
      {
        id: "str-2",
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        statement: "Given a string s, return the longest palindromic substring in s.",
        inputFormat: "Single line string",
        outputFormat: "Longest palindromic substring",
        constraints: "1 <= s.length <= 1000\ns consists of only digits and English letters",
        sampleInput: "babad",
        sampleOutput: "bab",
        explanation: "'aba' is also a valid answer. Both have length 3."
      }
    ]
  },
  {
    id: "linkedlist",
    title: "Linked List",
    icon: "Link2",
    questions: [
      {
        id: "ll-1",
        title: "Reverse Linked List",
        difficulty: "Easy",
        statement: "Given the head of a singly linked list, reverse the list, and return the reversed list. Implement using iterative approach.",
        inputFormat: "First line: n (number of nodes)\nSecond line: n space-separated values",
        outputFormat: "n space-separated values of reversed list",
        constraints: "0 <= n <= 5000\n-5000 <= Node.val <= 5000",
        sampleInput: "5\n1 2 3 4 5",
        sampleOutput: "5 4 3 2 1",
        explanation: "The linked list 1->2->3->4->5 becomes 5->4->3->2->1"
      },
      {
        id: "ll-2",
        title: "Detect Cycle in Linked List",
        difficulty: "Easy",
        statement: "Given head, the head of a linked list, determine if the linked list has a cycle in it. Return true if there is a cycle, false otherwise.",
        inputFormat: "First line: n pos (number of nodes and cycle position, -1 if no cycle)\nSecond line: n space-separated values",
        outputFormat: "true or false",
        constraints: "0 <= n <= 10^4\n-10^5 <= Node.val <= 10^5\npos is -1 or a valid index",
        sampleInput: "4 1\n3 2 0 -4",
        sampleOutput: "true",
        explanation: "There is a cycle where tail connects to node index 1 (value 2)."
      }
    ]
  },
  {
    id: "stack",
    title: "Stack",
    icon: "Layers",
    questions: [
      {
        id: "stk-1",
        title: "Valid Parentheses",
        difficulty: "Easy",
        statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets are closed by the same type, and in the correct order.",
        inputFormat: "Single line string of brackets",
        outputFormat: "true or false",
        constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'",
        sampleInput: "()[]{}",
        sampleOutput: "true",
        explanation: "Each opening bracket has a matching closing bracket in correct order."
      },
      {
        id: "stk-2",
        title: "Next Greater Element",
        difficulty: "Medium",
        statement: "Given an array, print the Next Greater Element for every element. The NGE for an element x is the first greater element on the right side of x in the array. If no greater element exists, output -1.",
        inputFormat: "First line: n\nSecond line: n space-separated integers",
        outputFormat: "n space-separated integers (NGE for each element)",
        constraints: "1 <= n <= 10^5\n1 <= arr[i] <= 10^9",
        sampleInput: "4\n4 5 2 25",
        sampleOutput: "5 25 25 -1",
        explanation: "NGE of 4 is 5, NGE of 5 is 25, NGE of 2 is 25, NGE of 25 is -1."
      }
    ]
  },
  {
    id: "queue",
    title: "Queue",
    icon: "ArrowRightLeft",
    questions: [
      {
        id: "q-1",
        title: "Implement Queue using Stacks",
        difficulty: "Easy",
        statement: "Implement a first-in-first-out (FIFO) queue using only two stacks. The implemented queue should support push, pop, peek, and empty operations.",
        inputFormat: "Operations: push x, pop, peek, empty",
        outputFormat: "Result of each operation",
        constraints: "1 <= x <= 9\nAt most 100 calls",
        sampleInput: "push 1\npush 2\npeek\npop\nempty",
        sampleOutput: "null\nnull\n1\n1\nfalse",
        explanation: "Queue follows FIFO. Push 1, push 2. Peek returns 1 (front). Pop removes 1. Queue is not empty."
      }
    ]
  },
  {
    id: "recursion",
    title: "Recursion",
    icon: "Repeat",
    questions: [
      {
        id: "rec-1",
        title: "Generate Parentheses",
        difficulty: "Medium",
        statement: "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
        inputFormat: "Single integer n",
        outputFormat: "All valid combinations, one per line",
        constraints: "1 <= n <= 8",
        sampleInput: "3",
        sampleOutput: "((()))\n(()())\n(())()\n()(())\n()()()",
        explanation: "All possible valid arrangements of 3 pairs of parentheses."
      },
      {
        id: "rec-2",
        title: "Tower of Hanoi",
        difficulty: "Medium",
        statement: "Solve the Tower of Hanoi problem. Move n disks from source rod to destination rod using an auxiliary rod. Only one disk can be moved at a time and no larger disk can be placed on a smaller one.",
        inputFormat: "Single integer n (number of disks)",
        outputFormat: "Each line: Move disk X from A to C",
        constraints: "1 <= n <= 20",
        sampleInput: "2",
        sampleOutput: "Move disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C",
        explanation: "Minimum moves = 2^n - 1 = 3 for n=2."
      }
    ]
  },
  {
    id: "searching",
    title: "Searching",
    icon: "Search",
    questions: [
      {
        id: "srch-1",
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        statement: "Given an integer array nums sorted in ascending order with distinct values, rotated at an unknown pivot. Given a target value, return its index or -1 if not found. Algorithm must be O(log n).",
        inputFormat: "First line: n target\nSecond line: n space-separated integers",
        outputFormat: "Index of target or -1",
        constraints: "1 <= n <= 5000\n-10^4 <= nums[i], target <= 10^4\nAll values are unique",
        sampleInput: "7 0\n4 5 6 7 0 1 2",
        sampleOutput: "4",
        explanation: "Target 0 is found at index 4 in the rotated array."
      }
    ]
  },
  {
    id: "sorting",
    title: "Sorting",
    icon: "ArrowUpDown",
    questions: [
      {
        id: "sort-1",
        title: "Sort Colors (Dutch National Flag)",
        difficulty: "Medium",
        statement: "Given an array with n objects colored red (0), white (1), or blue (2), sort them in-place so that same colors are adjacent, in the order red, white, blue. Do not use library sort.",
        inputFormat: "First line: n\nSecond line: n space-separated integers (0, 1, or 2)",
        outputFormat: "n space-separated sorted integers",
        constraints: "1 <= n <= 300\nnums[i] is 0, 1, or 2",
        sampleInput: "6\n2 0 2 1 1 0",
        sampleOutput: "0 0 1 1 2 2",
        explanation: "Dutch National Flag algorithm uses three pointers for single-pass sorting."
      }
    ]
  },
  {
    id: "hashing",
    title: "Hashing",
    icon: "Hash",
    questions: [
      {
        id: "hash-1",
        title: "Group Anagrams",
        difficulty: "Medium",
        statement: "Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word formed by rearranging letters of another word.",
        inputFormat: "First line: n\nNext n lines: one string each",
        outputFormat: "Groups of anagrams, each group on a line",
        constraints: "1 <= n <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters",
        sampleInput: "6\neat tea tan ate nat bat",
        sampleOutput: "eat tea ate\ntan nat\nbat",
        explanation: "Anagram groups: [eat,tea,ate], [tan,nat], [bat]"
      }
    ]
  },
  {
    id: "twopointer",
    title: "Two Pointer",
    icon: "ChevronsLeftRight",
    questions: [
      {
        id: "tp-1",
        title: "Container With Most Water",
        difficulty: "Medium",
        statement: "Given n non-negative integers a1, a2, ..., an where each represents a point at coordinate (i, ai). Find two lines that together with the x-axis form a container that holds the most water.",
        inputFormat: "First line: n\nSecond line: n space-separated integers",
        outputFormat: "Maximum area",
        constraints: "2 <= n <= 10^5\n0 <= height[i] <= 10^4",
        sampleInput: "9\n1 8 6 2 5 4 8 3 7",
        sampleOutput: "49",
        explanation: "Lines at index 1 (height 8) and index 8 (height 7). Area = min(8,7) * (8-1) = 49."
      }
    ]
  },
  {
    id: "slidingwindow",
    title: "Sliding Window",
    icon: "PanelLeftOpen",
    questions: [
      {
        id: "sw-1",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        statement: "Given a string s, find the length of the longest substring without repeating characters.",
        inputFormat: "Single line string",
        outputFormat: "Integer - length of longest substring",
        constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces",
        sampleInput: "abcabcbb",
        sampleOutput: "3",
        explanation: "The answer is 'abc', with length 3."
      }
    ]
  },
  {
    id: "binarysearch",
    title: "Binary Search",
    icon: "Split",
    questions: [
      {
        id: "bs-1",
        title: "Find Peak Element",
        difficulty: "Medium",
        statement: "A peak element is an element that is strictly greater than its neighbors. Given an integer array nums, find a peak element and return its index. If the array contains multiple peaks, return the index to any of the peaks. O(log n) solution required.",
        inputFormat: "First line: n\nSecond line: n space-separated integers",
        outputFormat: "Index of peak element",
        constraints: "1 <= n <= 1000\n-2^31 <= nums[i] <= 2^31 - 1\nnums[i] != nums[i+1] for all valid i",
        sampleInput: "4\n1 2 3 1",
        sampleOutput: "2",
        explanation: "nums[2] = 3 is a peak element since 3 > 2 and 3 > 1."
      }
    ]
  },
  {
    id: "trees",
    title: "Trees",
    icon: "GitBranch",
    questions: [
      {
        id: "tree-1",
        title: "Maximum Depth of Binary Tree",
        difficulty: "Easy",
        statement: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        inputFormat: "Level-order traversal with null for missing nodes",
        outputFormat: "Single integer - maximum depth",
        constraints: "0 <= number of nodes <= 10^4\n-100 <= Node.val <= 100",
        sampleInput: "3 9 20 null null 15 7",
        sampleOutput: "3",
        explanation: "The tree has depth 3: root(3) -> right(20) -> left(15) or right(7)."
      },
      {
        id: "tree-2",
        title: "Level Order Traversal",
        difficulty: "Medium",
        statement: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
        inputFormat: "Level-order input with null for missing nodes",
        outputFormat: "Each level on a new line, space-separated",
        constraints: "0 <= number of nodes <= 2000\n-1000 <= Node.val <= 1000",
        sampleInput: "3 9 20 null null 15 7",
        sampleOutput: "3\n9 20\n15 7",
        explanation: "Level 0: [3], Level 1: [9, 20], Level 2: [15, 7]"
      }
    ]
  },
  {
    id: "bst",
    title: "BST",
    icon: "GitFork",
    questions: [
      {
        id: "bst-1",
        title: "Validate BST",
        difficulty: "Medium",
        statement: "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST: left subtree contains only nodes with keys less than node's key; right subtree only nodes with keys greater.",
        inputFormat: "Level-order traversal",
        outputFormat: "true or false",
        constraints: "1 <= number of nodes <= 10^4\n-2^31 <= Node.val <= 2^31 - 1",
        sampleInput: "5 1 4 null null 3 6",
        sampleOutput: "false",
        explanation: "Root is 5, but right child 4 is less than 5. Invalid BST."
      }
    ]
  },
  {
    id: "heaps",
    title: "Heaps",
    icon: "Triangle",
    questions: [
      {
        id: "heap-1",
        title: "Kth Largest Element",
        difficulty: "Medium",
        statement: "Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in sorted order, not the kth distinct element.",
        inputFormat: "First line: n k\nSecond line: n space-separated integers",
        outputFormat: "Single integer",
        constraints: "1 <= k <= n <= 10^5\n-10^4 <= nums[i] <= 10^4",
        sampleInput: "6 2\n3 2 1 5 6 4",
        sampleOutput: "5",
        explanation: "Sorted: [1,2,3,4,5,6]. 2nd largest = 5."
      }
    ]
  },
  {
    id: "graphs",
    title: "Graphs",
    icon: "Network",
    questions: [
      {
        id: "graph-1",
        title: "Number of Islands",
        difficulty: "Medium",
        statement: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
        inputFormat: "First line: m n\nNext m lines: n characters each ('0' or '1')",
        outputFormat: "Number of islands",
        constraints: "1 <= m, n <= 300\ngrid[i][j] is '0' or '1'",
        sampleInput: "4 5\n11110\n11010\n11000\n00000",
        sampleOutput: "1",
        explanation: "All land cells are connected, forming one island."
      }
    ]
  },
  {
    id: "dp",
    title: "Dynamic Programming",
    icon: "Table2",
    questions: [
      {
        id: "dp-1",
        title: "Climbing Stairs",
        difficulty: "Easy",
        statement: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        inputFormat: "Single integer n",
        outputFormat: "Number of distinct ways",
        constraints: "1 <= n <= 45",
        sampleInput: "5",
        sampleOutput: "8",
        explanation: "Ways: 1+1+1+1+1, 1+1+1+2, 1+1+2+1, 1+2+1+1, 2+1+1+1, 2+2+1, 2+1+2, 1+2+2 = 8 ways."
      },
      {
        id: "dp-2",
        title: "Longest Common Subsequence",
        difficulty: "Medium",
        statement: "Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is a sequence derived by deleting some or no elements without changing the order.",
        inputFormat: "Two lines, one string each",
        outputFormat: "Length of LCS",
        constraints: "1 <= text1.length, text2.length <= 1000\nStrings consist of lowercase English characters only",
        sampleInput: "abcde\nace",
        sampleOutput: "3",
        explanation: "The longest common subsequence is 'ace' with length 3."
      }
    ]
  },
  {
    id: "greedy",
    title: "Greedy",
    icon: "Gem",
    questions: [
      {
        id: "gr-1",
        title: "Activity Selection",
        difficulty: "Easy",
        statement: "Given N activities with their start and finish times, select the maximum number of activities that can be performed by a single person, assuming that a person can only work on a single activity at a time.",
        inputFormat: "First line: n\nSecond line: n start times\nThird line: n finish times",
        outputFormat: "Maximum number of activities",
        constraints: "1 <= n <= 10^5\n1 <= start[i] < finish[i] <= 10^9",
        sampleInput: "6\n1 3 0 5 8 5\n2 4 6 7 9 9",
        sampleOutput: "4",
        explanation: "Select activities: (1,2), (3,4), (5,7), (8,9) = 4 activities."
      }
    ]
  },
  {
    id: "backtracking",
    title: "Backtracking",
    icon: "Undo2",
    questions: [
      {
        id: "bt-1",
        title: "N-Queens",
        difficulty: "Hard",
        statement: "Place N chess queens on an N x N chessboard so that no two queens threaten each other. Return the number of distinct solutions.",
        inputFormat: "Single integer n",
        outputFormat: "Number of distinct solutions",
        constraints: "1 <= n <= 9",
        sampleInput: "4",
        sampleOutput: "2",
        explanation: "There are two distinct solutions to the 4-queens puzzle."
      }
    ]
  },
  {
    id: "tries",
    title: "Tries",
    icon: "TreePine",
    questions: [
      {
        id: "trie-1",
        title: "Implement Trie (Prefix Tree)",
        difficulty: "Medium",
        statement: "Implement a trie with insert, search, and startsWith methods. insert(word) inserts a word, search(word) returns true if exact word exists, startsWith(prefix) returns true if any word starts with prefix.",
        inputFormat: "Operations: insert word, search word, startsWith prefix",
        outputFormat: "Result of each search/startsWith operation",
        constraints: "1 <= word.length, prefix.length <= 2000\nword and prefix consist of lowercase English letters\nAt most 3 * 10^4 calls total",
        sampleInput: "insert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app\nsearch app",
        sampleOutput: "null\ntrue\nfalse\ntrue\nnull\ntrue",
        explanation: "After inserting 'apple', searching 'app' returns false (not complete word). But startsWith 'app' returns true."
      }
    ]
  }
];

export const aptitudeTopics = [
  {
    id: "quantitative",
    title: "Quantitative Aptitude",
    icon: "Calculator",
    color: "#00F0FF",
    description: "Master numbers, percentages, profit/loss, and mathematical reasoning",
    videos: [
      { title: "Aptitude Preparation for Placements 2025", videoId: "CZZfiegkBl4", duration: "45:00", channel: "PrepInsta" },
      { title: "How to Prepare Aptitude for Placements", videoId: "TOkZzs6OVTk", duration: "18:30", channel: "Career Guide" },
      { title: "Top Tips & Tricks for Aptitude", videoId: "mSWitjHI1Ko", duration: "22:15", channel: "Aptitude Guru" },
      { title: "TCS NQT Aptitude - Statistics + Percentage", videoId: "VFhVa99wdf8", duration: "25:00", channel: "GeeksforGeeks" },
    ],
    quizTopics: ["Percentages", "Profit & Loss", "Simple Interest", "Compound Interest"]
  },
  {
    id: "probability",
    title: "Probability",
    icon: "Dices",
    color: "#7000FF",
    description: "Understand probability concepts, Bayes theorem, and conditional probability",
    videos: [
      { title: "Probability for Placement Aptitude", videoId: "D0Hc_eodKSU", duration: "40:00", channel: "CAT Prep" },
      { title: "Probability Tricks & Shortcuts", videoId: "ZA5io324D9I", duration: "28:10", channel: "Aptitude Academy" },
      { title: "Probability Basics - Step by Step", videoId: "Qz-WBXsLkos", duration: "15:45", channel: "Math Made Easy" },
      { title: "Probability Practice Problems", videoId: "gT_riJtb1xg", duration: "22:30", channel: "TalentSprint" },
    ],
    quizTopics: ["Basic Probability", "Conditional Probability", "Bayes Theorem", "Dice & Cards"]
  },
  {
    id: "permcomb",
    title: "Permutation & Combination",
    icon: "Shuffle",
    color: "#00FF94",
    description: "Learn counting principles, arrangements, and selections",
    videos: [
      { title: "Permutations & Combinations Complete Guide", videoId: "D0Hc_eodKSU", duration: "40:00", channel: "Quant Master" },
      { title: "P&C Shortcuts for Placements", videoId: "ETiRE7N7pEI", duration: "18:25", channel: "Aptitude Tricks" },
      { title: "Permutations Explained Step-by-Step", videoId: "XJnIdRXUi7A", duration: "20:00", channel: "Math Tutorial" },
      { title: "Combination Introduction & Examples", videoId: "VSoJwlYdCWM", duration: "16:40", channel: "Quant Aptitude" },
    ],
    quizTopics: ["Permutations", "Combinations", "Circular Arrangement", "Word Formation"]
  },
  {
    id: "timework",
    title: "Time & Work",
    icon: "Clock",
    color: "#FFD600",
    description: "Master work efficiency, pipes & cisterns, and combined work problems",
    videos: [
      { title: "Time and Work Shortcuts & Tricks", videoId: "KE7tQf9spPg", duration: "24:30", channel: "Aptitude Prep" },
      { title: "Time and Work Complete Concepts", videoId: "HX3PeaCLLks", duration: "35:00", channel: "RuntimeError" },
      { title: "Pipes and Cisterns Tricks", videoId: "TOkZzs6OVTk", duration: "18:00", channel: "Career Guide" },
      { title: "Work Efficiency Problems Solved", videoId: "CZZfiegkBl4", duration: "20:15", channel: "PrepInsta" },
    ],
    quizTopics: ["Work Rate", "Pipes & Cisterns", "Combined Work", "Efficiency"]
  },
  {
    id: "timedistance",
    title: "Time & Distance",
    icon: "Route",
    color: "#FF6B35",
    description: "Speed, distance, relative motion, trains, boats and streams",
    videos: [
      { title: "Time and Distance - TalentSprint", videoId: "bwbaM6FTaiA", duration: "22:00", channel: "TalentSprint" },
      { title: "Time and Distance Introduction", videoId: "ufbDCFUn6PY", duration: "18:30", channel: "FeelFreetoLearn" },
      { title: "Speed Distance Time Problems", videoId: "NzeKKgBwzhU", duration: "20:45", channel: "Maths Made Easy" },
      { title: "Distance Rate Time Word Problems", videoId: "yCSAcjXO4tU", duration: "15:20", channel: "Math Help" },
    ],
    quizTopics: ["Speed Conversion", "Relative Speed", "Trains", "Boats & Streams"]
  },
  {
    id: "percentages",
    title: "Percentages",
    icon: "Percent",
    color: "#E91E63",
    description: "Percentage calculations, successive changes, and applications",
    videos: [
      { title: "Percentages for Placement Aptitude", videoId: "VFhVa99wdf8", duration: "25:00", channel: "GeeksforGeeks" },
      { title: "Percentage Tricks & Shortcuts", videoId: "mSWitjHI1Ko", duration: "22:15", channel: "Aptitude Guru" },
      { title: "Percentage Problems Practice", videoId: "CZZfiegkBl4", duration: "30:00", channel: "PrepInsta" },
      { title: "Successive Percentage Changes", videoId: "HX3PeaCLLks", duration: "16:40", channel: "RuntimeError" },
    ],
    quizTopics: ["Basic Percentages", "Successive Change", "Population Growth", "Depreciation"]
  },
  {
    id: "ratio",
    title: "Ratio & Proportion",
    icon: "Scale",
    color: "#9C27B0",
    description: "Ratios, proportions, mixtures, and alligation concepts",
    videos: [
      { title: "Ratio and Proportion Concepts", videoId: "NzeKKgBwzhU", duration: "20:45", channel: "Maths Made Easy" },
      { title: "Ratio Problems for Placements", videoId: "TOkZzs6OVTk", duration: "18:00", channel: "Career Guide" },
      { title: "Mixtures and Alligation", videoId: "KE7tQf9spPg", duration: "24:30", channel: "Aptitude Prep" },
      { title: "Proportion Practice Problems", videoId: "ngGkXluuao4", duration: "20:10", channel: "ASVAB Prep" },
    ],
    quizTopics: ["Simple Ratio", "Proportion", "Mixtures", "Alligation"]
  },
  {
    id: "logical",
    title: "Logical Reasoning",
    icon: "Brain",
    color: "#00BCD4",
    description: "Sharpen analytical thinking, pattern recognition, and deduction",
    videos: [
      { title: "Logical Reasoning for Placements", videoId: "x9jZwqIknhU", duration: "28:00", channel: "Code With Deepa" },
      { title: "Verbal & Logical Ability Prep", videoId: "GPJ6GKhkMIM", duration: "60:00", channel: "Career Launcher" },
      { title: "Critical Reasoning Strategies", videoId: "TotM-r3KWZY", duration: "45:00", channel: "Career Launcher" },
      { title: "100 Reasoning Questions Practice", videoId: "PBosmmqJ0yI", duration: "90:00", channel: "BYJU'S" },
    ],
    quizTopics: ["Blood Relations", "Seating Arrangement", "Coding-Decoding", "Syllogisms"]
  },
  {
    id: "verbal",
    title: "Verbal Ability",
    icon: "BookOpen",
    color: "#4CAF50",
    description: "Improve vocabulary, grammar, and reading comprehension",
    videos: [
      { title: "Verbal Ability for Placements", videoId: "a70_caClAjY", duration: "35:00", channel: "SNAP Prep" },
      { title: "20 Aptitude Questions Solved", videoId: "x9jZwqIknhU", duration: "28:00", channel: "Code With Deepa" },
      { title: "Verbal & Logical Ability Revision", videoId: "GPJ6GKhkMIM", duration: "60:00", channel: "Career Launcher" },
      { title: "Grammar & Vocabulary for Interviews", videoId: "TotM-r3KWZY", duration: "45:00", channel: "Career Launcher" },
    ],
    quizTopics: ["Grammar", "Reading Comprehension", "Vocabulary", "Sentence Correction"]
  },
  {
    id: "data",
    title: "Data Interpretation",
    icon: "BarChart3",
    color: "#FF9800",
    description: "Learn to analyze charts, graphs, tables, and data sets efficiently",
    videos: [
      { title: "Data Interpretation for Placements", videoId: "x9jZwqIknhU", duration: "28:00", channel: "Code With Deepa" },
      { title: "Bar & Pie Chart Analysis", videoId: "CZZfiegkBl4", duration: "30:00", channel: "PrepInsta" },
      { title: "Table Data Interpretation", videoId: "VFhVa99wdf8", duration: "25:00", channel: "GeeksforGeeks" },
      { title: "DI Practice with Solutions", videoId: "PBosmmqJ0yI", duration: "90:00", channel: "BYJU'S" },
    ],
    quizTopics: ["Bar Graphs", "Pie Charts", "Data Tables", "Caselets"]
  },
];

export const languages = [
  { id: 71, name: "Python", label: "Python 3", monacoId: "python" },
  { id: 62, name: "Java", label: "Java", monacoId: "java" },
  { id: 54, name: "C++", label: "C++ 17", monacoId: "cpp" },
  { id: 63, name: "JavaScript", label: "JavaScript", monacoId: "javascript" },
];

export const defaultCode = {
  71: `# Python 3\ndef solution():\n    # Write your code here\n    pass\n\nsolution()`,
  62: `// Java\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}`,
  54: `// C++ 17\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  63: `// JavaScript (Node.js)\nconst readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    // Write your code here\n});`,
};

export const FALLBACK_INTERVIEW_QUESTIONS = [
  "Tell me about yourself and your background.",
  "What are your greatest strengths and how do they apply to this role?",
  "Describe a challenging project you worked on and how you handled it.",
  "Where do you see yourself in five years?",
  "Why should we hire you over other candidates?"
];
