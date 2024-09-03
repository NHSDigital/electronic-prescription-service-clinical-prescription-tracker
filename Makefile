run-jekyll:
	bundle exec jekyll serve

sync-main:
	git checkout use_semantic_release .tool-versions
	git checkout use_semantic_release .pre-commit-config.yaml
	git checkout use_semantic_release .gitignore
	git checkout use_semantic_release .devcontainer
	git checkout use_semantic_release pyproject.toml
	git checkout use_semantic_release poetry.lock
	git checkout use_semantic_release poetry.lock
	git checkout use_semantic_release package.json
	git checkout use_semantic_release package-lock.json

# install targets
install: install-python install-hooks install-node install-jekyll

install-python:
	poetry install

install-node:
	npm ci

install-jekyll:
	gem install jekyll bundler
	bundle install

install-hooks: install-python
	poetry run pre-commit install --install-hooks --overwrite