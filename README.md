# Axiv Node.js internal evaluation codebase

👋🏻 Welcome to our Node.js internal evaluation app!

This is the substrate you'll use to demonstrate your skills for the review committee, prior to your evaluation interview. Interviewers will have reviewed your submitted code before then, and will further discuss it with you during the interview.

- [🛠️ Set up this project](#️-set-up-this-project)
  - [📦 Prepare your databases](#-prepare-your-databases)
  - [✅ Verify your setup is correct](#-verify-your-setup-is-correct)
- [🗺️ Overview](#️-overview)
- [🏆 Challenges](#-challenges)
  - [Refactoring](#refactoring)
  - [Asynchrony best practices](#asynchrony-best-practices)
  - [Modern JS syntax](#modern-js-syntax)
  - [Efficient ORM / SQL usage](#efficient-orm--sql-usage)
  - [Tests](#tests)
- [📨 How to submit your test?](#-how-to-submit-your-test)
- [⏰ Deadline](#-deadline)

## 🛠️ Set up this project

1. Start by cloning this repository however you prefer.
2. Then open a terminal in the directory and run `npm install`.
3. Finally, open the directory in your Visual Studio Code as a project root.

For the purposes of this test, the `config/config.json` was versioned so you don't need to re-create it. In order for that configuration to work for you out of the box, please use the exact DB preparation script below.

### 📦 Prepare your databases

```bash
mariadb -u root -p
# Or on Linux / OSX, favor "sudo mariadb" instead
```

```sql
create database axiv_node_eval;
create database axiv_node_eval1;
create database axiv_node_eval_test;
create database axiv_node_eval_test1;
create user axiv_eval@localhost identified by 'axiv_eval';
grant all on axiv_node_eval.* to axiv_eval@localhost;
grant all on axiv_node_eval1.* to axiv_eval@localhost;
grant all on axiv_node_eval_test.* to axiv_eval@localhost;
grant all on axiv_node_eval_test1.* to axiv_eval@localhost;
```

Try logging in to one or more of your freshly-created databases, with the new account. For instance, on the development core database:

```bash
mariadb -u axiv_eval -paxiv_eval axiv_node_eval
```

Then seed the database using the following command:

```bash
npm run seed
```

You should see a boot display followed by a seeding confirmation.

### ✅ Verify your setup is correct

1. Launch the app with `npm run dev` (in the terminal or through VS Code's _Run Task_)
2. Verify the app boots properly
3. Open `dev-test-calls.test` and run the login request; verify it is successful
4. Run the healthcheck request; verify it is successful

## 🗺️ Overview

This application is a small quiz API.

- Quizzes avec titles and questions
- Questions belong to a single quiz
- Questions have multiple answers, only one of which is correct

It is based off the Node Master Project (NMP), but you don't need to be too familiar with it to proceed: you only need to know how write modern JS, use Sequelize models, and write tests.

Be sure to check out our in-house [JS and Node.js best practices](https://git.axivit.com/udf/documentation/-/tree/main/nodejs).

## 🏆 Challenges

The API is already booting up and "working," **but**:

1. The code processing incoming requests is all conflated in the route handlers, instead of being appropriately splitted between route handlers, models, and possibly actions or services. Also, HTTP response codes are not always properly chosen.
2. Some of the asynchrony-related code could use judicious cleanup towards recommended best practices.
3. There are a few spots where modern JS syntax, e.g. destructuring, would be a neater option.
4. There are issues with the test suite.

### Refactoring

The codebase uses a single file to describe routes and route handlers.

That code should probably be split in several, single-topic routers, and some of the code might be more logically located as business methods in model classes, instead of standalone functions or helpers.

Match these splits for relevant test files, too.

There's also a fair amount of duplication in entity-load checks that you might want to refactor as helpers (with or without using an existing NMP helper).

The returned status codes are also not always a best fit. Check out [our HTTP status code recommendations](https://git.axivit.com/udf/documentation/-/blob/main/nodejs/rest.md#proper-use-of-http-response-status-codes) for guidelines.

### Asynchrony best practices

Some of the code still uses old-style promise chains (e.g. `then()`) instead of `async` / `await`, which is pretty much always a better option. Some functions mix both styles.

There may also be occasions when database operation batches are processed in sequence instead of being parallelized for faster overall client response time.

- Harmonize asynchronous code style towards proper `async` / `await`
- Spot needless sequencing of batch operations and turn them into cleaner, parallelized processing.

### Modern JS syntax

Some of the code (not just in the route handlers, either) is unnecessarily verbose and could be considerably shortened by making proper use of ES2015+ syntaxes. It may also use old-school numeric-index loops instead of more modern loops or, when relevant, `map()` operations.

Try to spot these occurrences and improve them.

### Efficient ORM / SQL usage

Two static methods are left to be implemented in `Quiz`. These are two business finders that return a promise for quizzes with questions that either stay in a single category (`getSingleCategoryQuizzes()`) or span multiple categories (`getMultipleCategoryQuizzes()`). These may either return promises for fully-formed results (e.g. arrays, possibly sorted) or return preset query objects that can be further refined (e.g. with sorting, field selection, etc.), which the route handlers would then refine (as they do with the bare-bones `findAll()` in the main quiz listing route).

Whether you go with raw SQL (that would then need to be properly, dynamically escaped / safeguarded), the ORM's query gradual construction methods, or pure-JS checking and filtering, is up to you. Be prepared to explain and defend your implementation choices during the interview.

### Tests

A test suite is provided for the API routes. However, it has issues:

- Three of the tests fail **for a good reason**. This means the test is appropriate, but the code being tested has a flaw that needs to be fixed (or implemented, for category-mode-based quiz listings).
- One of the tests fails **but shouldn't**: the tested feature actually works, but the test is incorrectly written, so fix the test itself.
- A couple tests still need to be written. Deriving them from existing tests shouldn't be too difficult.

**Note:** Remember to split the test suite in appropriate files to match the production code split you'll have done in the "Refactoring" part!

## 📨 How to submit your test?

The IT team at Axiv provided you with a dedicated GitLab repo for this: feel free to push your work to it.

You are free to commit as often as you'd like, go back and forth, etc.

However, ultimately, the Git history you'll eventually push on top of the initial commit should look reasonably “clean,” with a reasonable sequence of “atomic” (single-topic) commits, single topics not spread across too many commits, and topics preferrably not interleaved along the history.

One way to do this would be, once your work is complete, to perform an interactive rebase of your local `main` branch on top of its initial commit and then tidy up your local history (group related commits, squash some, split some, remove some, etc.), to finally force-push your updated, clean-history `main`.

## ⏰ Deadline

The e-mail that provided you with all your test details, including this repo's dedicated URL, should have mentioned a deadline for final submission. Make sure your latest work is pushed by then, so the evaluation team has enough time to review your code before the interview.

Thanks! We look forward to your submission!
