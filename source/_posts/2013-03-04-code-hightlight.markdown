---
layout: post
title: "测试代码高亮"
date: 2013-03-04 22:47
comments: true
categories: others
---
##Javascript
``` js 这是一段javascript代码
	$(function(){
		$('div').click(function(){
			alert('click on '+$(this).attr('name'));
		}
	}
```
<!-- more -->
##C
``` c 这是一段C语言代码
	void main(){
		printf("hello world");
	}
```

##C Sharp
``` c# 这是一段C#代码
	public class Human{

		private string name;

		public Human(string name){
			this.name=name;
		}

		public void SayHi(){
			Console.WriteLine(String.Format("Hi, I am {0}. Nice to meet you.",this.name));
		}
	}
```
##Golang
``` go 这是一段golang代码
	package main

	import fmt "fmt"  // Package implementing formatted I/O.


	func main() {
		fmt.Printf("Hello, world; or Καλημέρα κόσμε; or こんにちは 世界\n")
	}
```
##Python
``` python 这是一段Python代码
	#!/usr/bin/python
	# Filename: mymodule.py

	def sayhi():
		print 'Hi, this is mymodule speaking.'

	version = '0.1'

	# End of mymodule.py
```
