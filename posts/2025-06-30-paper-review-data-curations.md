---
title: "Review: Data Curation for Imitation Learning"
date: "2025-06-30"
author: "Younghyo Park"
tags: ["imitation learning", "data curation", "paper review"]
excerpt: "A review on recent data curation works for imitation learning."
featured: false
publish: false
---

<img src="posts/paper-review-data-curations/banner.png" class="width-75" alt="Banner">

# 1. Introduction


In Ubuntu, there’s a long-running joke: ***“less is more.”*** That’s because the [less](https://manpages.ubuntu.com/manpages/xenial/man1/less.1.html#:~:text=Less%20is%20a%20program%20similar,on%20a%20variety%20of%20terminals.) command, despite its name, actually offers more functionality than more. It lets you scroll both up and down, search, and even view large files more efficiently—ironically making less the superior tool.

> Less  is  a  program  similar to more (1), but it has many more features.  Less does not have to read the entire input file before starting, so with large input files it starts up faster than text  editors  like vi (1).  Less uses termcap (or terminfo on some systems), so it can run on a variety of terminals.  


A similar paradox shows up in imitation learning.

In theory, imitation learning should benefit from more data. After all, more demonstrations should mean more diverse experiences to learn from, and better generalization. But in practice, things often break in the opposite direction. Larger datasets can hurt performance. Meanwhile, carefully curated, smaller datasets often yield surprisingly better performance.

This contradiction has sparked growing interest in a new line of research: data curation for imitation learning. Rather than just scaling data collection blindly, recent work asks: What data is actually helpful for learning good policies? How do we identify and retain valuable demonstrations while filtering out detrimental ones? Can we automatically prioritize examples that contribute most to performance, generalization, or robustness?

In this review, I’ll summarize and compare recent efforts to answer these questions. We’ll look at techniques like filtering based on expert confidence, learning progress, disagreement metrics, and trajectory quality. We’ll look at 4 papers that are published very recently in a short period. 

<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://arxiv.org/abs/2503.03707" data-iframely-url="https://cdn.iframe.ly/api/iframe?url=https%3A%2F%2Farxiv.org%2Fabs%2F2503.03707&key=c83ccbd468865921bb411be91b22b1bb"></a></div></div><script async src="https://cdn.iframe.ly/embed.js" charset="utf-8"></script>

<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://arxiv.org/abs/2502.08623" data-iframely-url="https://cdn.iframe.ly/api/iframe?url=https%3A%2F%2Farxiv.org%2Fabs%2F2502.08623&key=c83ccbd468865921bb411be91b22b1bb"></a></div></div><script async src="https://cdn.iframe.ly/embed.js" charset="utf-8"></script>

<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://arxiv.org/abs/2506.19121" data-iframely-url="https://cdn.iframe.ly/api/iframe?url=https%3A%2F%2Farxiv.org%2Fabs%2F2506.19121&key=c83ccbd468865921bb411be91b22b1bb"></a></div></div><script async src="https://cdn.iframe.ly/embed.js" charset="utf-8"></script>

<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://proceedings.mlr.press/v229/kuhar23a.html" data-iframely-url="https://cdn.iframe.ly/api/iframe?url=https%3A%2F%2Fproceedings.mlr.press%2Fv229%2Fkuhar23a.html&key=c83ccbd468865921bb411be91b22b1bb"></a></div></div><script async src="https://cdn.iframe.ly/embed.js" charset="utf-8"></script>

<!-- https://arxiv.org/abs/2503.03707

https://arxiv.org/abs/2506.19121

https://proceedings.mlr.press/v229/kuhar23a.html -->


# 2. Data Curation Outside of Robotics



# 3. Paper Reviews

# 4. Conclusion