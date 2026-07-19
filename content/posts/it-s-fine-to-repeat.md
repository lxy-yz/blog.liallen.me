---
id: "3fb33813-555f-4f61-921d-1677bed83640"
title: "It’s fine to repeat"
slug: "it-s-fine-to-repeat"
date: "2022-08-18"
updated: 1778859900000
description: ""
tags: ["Technology"]
---
[Embedded video](https://youtu.be/8bZh5LMaSmE?t=905)
> Duplication is far cheaper than the wrong abstraction - [Sandi Metz](https://sandimetz.com/about)

I was thinking about [decision making](/b83b34118b0943dd953d4f364ee4bfc9?pvs=25) lately with a wish to synthesize something into [principles](/cdd16a320ed647b6b28e3354ea3fe44a) so that I don’t have to decide again and again in similar situations. But should I reach out to principles when something happened for the first or second time? I was thinking if programming can shed some light on this.

Imagine a software engineer working on a feature, and getting stumbled across something like
```ruby
# somewhere in code
do_foo
do_bar

# elsewhere in code
do_foo
do_bar
```
And your engineering instinct immediately whispers in your ear that “Don’t repeat yourself”, the famous [DRY principle](https://en.wikipedia.org/wiki/Don't_repeat_yourself) that every [**professional**](https://www.reddit.com/r/gatekeeping/comments/j4r25w/can_always_count_on_dudes_to_gatekeep_software/?utm_source=share&utm_medium=mweb3x) software engineer knows and abuses it

    ```diff
# somewhere in code
- do_foo
- do_bar
+ i_am_dry

# elsewhere in code
- do_foo
- do_bar
+ i_am_dry
    ```

    ```ruby
def i_am_dry
  do_foo
  do_bar
end
    ```

However, we all know that code are meant to be changed as requirements(customer needs) change all the time, but any [**elite**](https://twitter.com/levelsio/status/1560001713423147008?s=20&t=BxQQUoDJ9Rtcb-qx2YWhug) software engineer earning 6 figures  a year must have heard about [Refactoring](https://martinfowler.com/books/refactoring.html)

    ```diff
# somewhere in code
- do_foo
- do_bar
+ i_am_dry

# elsewhere in code
- do_bar
- do_baz
+ i_am_dry
    ```

    ```ruby
def i_am_dry(A)
  if some_condition(A)
    do_bar
    do_baz
  else
    do_foo
    do_bar
  end
end
    ```

Eventually we may end up with code that is super “DRY”, as Sandi Metz famously endowed it as [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction). But we are confident about ourselves because it’s consistent. What’s even better is that our career gets elevated this way and we become the domain expert who’s essentially irreplaceable for the job, proudly 🚢  code that we ourself can not understand after six months.

    ```diff
# somewhere in code
- do_foo
- do_bar
+ i_am_super_dry

# elsewhere in code
- ...
+ i_am_super_dry

...

# elsewhere in code
- ...
+ i_am_super_dry
    ```

    ```ruby
def i_am_super_dry(A, B, ..., Z)
  case true
  when some_condition(A)
    ...
  when some_condition(B)
    ...
  when some_condition(Z)
    ...
  else
    do_foo
    do_bar
  end
end
    ```

I am not a fan of over-engineering or [premature optimizations](https://wiki.c2.com/?PrematureOptimization), so I generally embrace the [Rule of three](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)) from Martin Fowler. And I firmly believe that the cost of wrong abstraction is **way** **higher** than no abstraction at all. Without fully understand the situation, we can’t even be sure if the situations are similar to each other or not. Therefore, it might be okay to just [let the randomness rule](/e5e8125fd1e143fb9df0c2e0e237dbaf?pvs=25) from time to time.
