---
layout: post
title: "新换系统之吐槽ruby安装"
date: 2013-12-25 22:53
comments: true
categories: linux
---

手贱把Ubuntu搞挂了，不要问我怎么搞的，我也不知道。刚刚好，觉得那个Unity环境真是非常非常非常非常非常无法忍受的难用到无与伦比，听说有个家伙叫mint，用了都说好。  
mint系统还不错啦，就是那个图标都是圆角是不是太土包子了，一看到那个默认的firefox图标我就想吐，罢了，反正也不用，删掉，装个chrome。装完了才发现，我们高端大气上档次的chrome图标也被系统弄成圆角方块疙瘩了，瞬间变村姑。忍了！
进入正题，把博客从github上clone下来之后，就又遇到了每次装系统必折腾之ruby版本问题。

###我安装，我快乐
对于Ruby，我是完全不懂，也不知道为什么要搞那么复杂。

既然需要1.9.3版本的，那先来`sudo apt-get install ruby1.9.3`，这一步没有任何问题，安装成功，执行`ruby -v`显示`ruby 1.9.3p194 (2012-04-20 revision 35410) [i686-linux]`

###悲剧是怎样炼成的

接下来进入blob文件夹根目录，执行`gem install bundler`,这一步顺利通过，悲剧马上来袭。当欢欢喜喜的执行`bundle install`时候，一个华丽丽的错误出现了  
```bash
Gem::Installer::ExtensionBuildError: ERROR: Failed to build gem native extension.

        /usr/bin/ruby1.9.1 extconf.rb 
/usr/lib/ruby/1.9.1/rubygems/custom_require.rb:36:in `require': cannot load such file -- mkmf (LoadError)
	from /usr/lib/ruby/1.9.1/rubygems/custom_require.rb:36:in `require'
	from extconf.rb:1:in `<main>'


Gem files will remain installed in /home/neeo/.bundler/tmp/21599/gems/RedCloth-4.2.9 for inspection.
Results logged to /home/neeo/.bundler/tmp/21599/gems/RedCloth-4.2.9/ext/redcloth_scan/gem_make.out

An error occurred while installing RedCloth (4.2.9), and Bundler cannot continue.
Make sure that `gem install RedCloth -v '4.2.9'` succeeds before bundling.

```
###rvm来了
好吧，老老实实的Google，各种答案铺天盖地，看来看去呢，基本上都是要rvm。在终端中执行rvm试试看
提示可以通过 `sudo apt-get install ruby-rvm`来安装， so easy, 但是敲了这段命令后，你会得到一个奇葩的结果`Error:未发现软件包ruby-rvm`o(╯□╰)o，这都难不倒我的，google下rvm怎么安装，好么，要用到另一个名曰curl的家伙，这回apt-get是可以安装的，然后执行`curl -L https://get.rvm.io | bash -s stable` 就可安装rvm了。  
`rvm -v`显示`rvm 1.25.6 (stable) by Wayne E. Seguin <wayneeseguin@gmail.com>, Michal Papis <mpapis@gmail.com> [https://rvm.io/]
`(ps:你得先执行`source ~/.rvm/scripts/rvm`载入rvm,不然bash又要提示你`sudo apt-get install ruby-rvm`了。)

###rvm傻了
安装完rvm之后呢，执行`rvm install 1.9.3`，哇哈哈，过关斩将，毫不留情。这回`bundle install`试试看，错误依旧。( ⊙ o ⊙ )  
没关系，再来，google到有人说要这样安装
```bash
rvm pkg install openssl
rvm install 1.9.3 --with-openssl-dir=$rvm_path/usr
```
这...和openssl什么关系？？？，不明觉历，姑且一试。
事实上，第一条命令就执行错误了
```bash
Error running 'update_openssl_certs',
showing last 15 lines of /home/neeo/.rvm/log/1387980721/openssl.certs.log
```
第二条呢，是这样的结果
```bash
Already installed ruby-1.9.3-p484.
To reinstall use:

    rvm reinstall ruby-1.9.3-p484

Gemset '' does not exist, 'rvm ruby-1.9.3-p484 do rvm gemset create ' first, or append '--create'.
```
根据提示，执行 ```rvm ruby-1.9.3-p484 do rvm gemset create```
结果是
```bash
Ruby ruby-1.9.3-p484 is not installed.
```
这一会儿已经安装，一会儿又说没安装，是要闹哪样儿？？？

###问题解决
灵光一闪，也许是因为用apt-get安装了ruby1.9.3的缘故，先执行`sudo apt-get remove ruby1.9.3`卸载掉。然后`rvm reinstall ruby-1.9.3-p484`经过漫长的等待之后，再次执行`bundle install`，顺利通过了。

###结论
至于ruby是怎么回事儿，为什么这样安装会产生这样的问题，还是不知道，linux小白玩linux就是太折腾。最后再吐槽一下，新换的房子网络真是垃圾到爆了，各种卡有没有？各种loading没完没了有没有？室友还各种骄傲的说网络多么多么NB，无力吐槽。
