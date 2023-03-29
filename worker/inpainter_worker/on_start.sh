curl https://pyenv.run | bash
sudo apt-get install build-essential checkinstall libreadline-gplv2-dev libncursesw5-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev libssl-dev libffi-dev -y
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
pyenv install 3.8.8
pyenv global 3.8.8
pip install torch pika diffusers firebase_admin python_dotenv transformers accelerate

