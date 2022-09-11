# Create a jekyll container from ruby alpine image


# ruby 2.5 or later
FROM ruby:2.7-alpine3.15


# jeklyy dependencies to alpine
RUN apk update
RUN apk add --no-cache build-base gcc cmake git


# update the ruby bundler and install jekyll
RUN gem update bundler && gem install bundler jekyll