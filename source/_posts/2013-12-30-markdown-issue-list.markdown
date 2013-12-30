---
layout: post
title: "使用markdown问题汇总"
date: 2013-12-30 21:09
comments: true
categories: markdown
keywords: markdown issue
description: markdown question list for octopress
---
这个博客（基于[Octopress](https://github.com/imathis/octopress)）搭建已经有一段时间了，一直没怎么写，一是因为自己很懒，二也是因为一直不知道写什么，最近强迫自己写一些东西，因为有些内容还是值得记录下来的，权当做备忘录来使用。

这几天用[markdown](http://en.wikipedia.org/wiki/Markdown)的过程中碰到了一些问题的，既然我能遇到这些问题，我相信也有其他人会遇到相似的问题，这里做个简单的记录，这篇博客也会在后续的使用当中不断更新。

<!--more-->

###列表为何无法正确显示
第一个问题就是列表始终无法正确显示出来，譬如，我书写的是
	1. item1
	2. item2
	3. item3
最后generate出来的结果却是
	1. item12. item23. item3
无论我在每个点(.)后面预留多少个空格或者制表符，都无法得到想要的结果。无序列表也存在同样的问题。
解决方法是需要在每个列表块之前添加一个空白行，就像这样。
	<!--这里放置一个空行-->
	1. item1
	2. item2
	3. item3
###相邻两个列表块被合并了
问题总是一个接着一个的，当我需要书写两个相邻的列表块的时候，出来的结果总是被合并成一个，即便一个是有序列表，一个是无序列表。
例如，我这样写
	1. item1 on list1
	2. item2 on list1
	3. item3 on list1
	
	+ item1 on list2
	+ item2 on list2
	+ item2 on list2
出来的结果是这样的

1. item1 on list1
2. item2 on list1
3. item3 on list1

+ item1 on list2
+ item2 on list2
+ item2 on list2

这是一个很讨厌的问题，正要google的时候，突然，脑门上划过一道闪电，如果为两个列表块之间添加一个注释会怎么样？
	1. item1 on list1
	2. item2 on list1
	3. item3 on list1
	<!--大哥，我想要两个列表块-->
	+ item1 on list2
	+ item2 on list2
	+ item2 on list2
结果是，我真的得到了两个列表块.\(^o^)/~

1. item1 on list1
2. item2 on list1
3. item3 on list1
<!--大哥，我想要两个列表块-->
+ item1 on list2
+ item2 on list2
+ item2 on list2

###如何在列表中显示代码块
如果想把代码块嵌入列表中，那么你需要在代码块前面加一个空行，这个代码块前面的缩进至少为8个空格或者两个制表符，就像这样
	+ item 1
			<!--这里有个空行-->
	<!--这里两个制表符-->code block under item1
	+ item 2
			<!--这里有个空行-->
	<!--或者8个空格-->code block under item2
显示的结果就是这样的

+ item 1
			
		code block under item1
+ item 2

		code block under item2
  
如果你想要将
	``` langname description 
	```
这种形式书写的代码块嵌入列表项中，我没有找到方法，我的判断是不可以，至少目前是这样。

###如何显示table
目前为止，我还没有遇到需要写用table表达的内容的情况，这里纯粹好奇。
table是这样写的
	header1|header2|header3
	---|---|---|
	cell11|cell12|cell13
	cell21|cell22|cell23
出来的结果是

header1|header2|header3
---|---|---|
cell11|cell12|cell13
cell21|cell22|cell23

这里需要注意，这个`table`的`html`就是由纯粹的`<table>`,`<thead>`,`<tbody>`,`<tr>`,`<td>`等组成的，是没有诸如`class`等任何属性的，所以你看到的会是这个样子，那么如何为`table`添加`class`属性呢？我不知道，网上也有很多人再问这个问题了，现在比较通用的答案呢，都是为全局的`table`设置一个样式，譬如，加一个这样的样式表
``` css table style
.entry-content table{
	width:100%;
	border:1px solid #333;
}
.entry-content table thead{
	/*thead style here*/
}
/*other style, tbody, tr, td and so on*/

```
这个解决方案虽然比较ugly，但的确是可以解决这个问题的，我因为偷懒，没有加这个样式。也许将来有一天我突然勤快一下，你会看到这个table变样了。
另外，如果你想让一个单元格占据多行或者多列，（设置`colspan`或者`rowspan`),那么别想了，没有这个功能，或者你可以直接写html嵌入markdown文件。

