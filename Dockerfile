FROM ruby:3.3.0-slim

LABEL Name=softlearn Version=0.0.1

EXPOSE 3000

# Install dependencies
RUN apt-get update -qq && apt-get install -y build-essential postgresql-client && rm -rf /var/lib/apt/lists/*

# throw errors if Gemfile has been modified since Gemfile.lock
RUN bundle config --global frozen 1

WORKDIR /app
COPY . /app

# Bundle install
RUN bundle install

CMD ["rails", "s", "-b", "0.0.0.0"]
