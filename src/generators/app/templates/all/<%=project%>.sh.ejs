#!/bin/bash

export PIPENV_VENV_IN_PROJECT=1
root=$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)

source "$root/scripts/_aws.sh"
source "$root/scripts/_terraform.sh"
source "$root/scripts/_test.sh"
source "$root/scripts/_make.sh"

function _show_help() {
    echo
    echo "<%=project%> <command> [options]"
    echo
    echo "This helper script calls terraform, enforcing some conventions:"
    echo "  1. work from root directory"
    echo "  2. include workspaces"
    echo "  3. force plan files"
    echo
    echo "commands:"
    echo "  help      - this help screen"
    echo "  make      - calls the make/build routines"
    echo "  aws       - aws commands"
    echo "  terraform - terraform commands"
    echo "  test      - run tests"
    echo
}

function <%=project%>() {
  local current
  local command=$1
  current=$(pwd)

  cd $root

  case $command in
    "aws") _aws "${@:2}" ;;
    "make") _make "${@:2}" ;;
    "make:root") _make_root "${@:2}" ;;
    "terraform") _terraform "${@:2}" ;;
    "test") _test "${@:2}" ;;
    *) _show_help ;;
  esac

  cd $current
}

echo "Usage: <%=project%>"
