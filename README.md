# ECMA tags

[![Build Status](https://travis-ci.org/aklt/ecmatags.svg?branch=master)](https://travis-ci.org/aklt/ecmatags)

 Create a tags file using [Esprima](http://esprima.org/).  JSX should also be
 supported.

## Description

There are a few options:

    # ecmatags --help
    Usage: ecmatags [options] [files]
      Options are:
        --help               show help
        --version            show version
        --limit <number>     max parallel, default 1 + CPUs / 2
        --exclude <pattern>  ignore this pattern. Include several --exclude
                             options to ignore more patterns
