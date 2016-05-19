#!/bin/sh
### BEGIN INIT INFO
# Provides:
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Author:            !author
# Description:       !description
### END INIT INFO

name="!name"
wd="!wd"
cmd="!cmd"
reload="!reload"
user="!user"

pid_file="!pid"
stdout_log="!stdout"
stderr_log="!stderr"

#!env

get_pid() {
    cat "$pid_file"
}

is_running() {
    [ -f "$pid_file" ] && ps `get_pid` > /dev/null 2>&1
}

case "$1" in
    start)
      if is_running; then
          echo "Already started"
      else
          echo "Starting $name"
          cd "$wd"
          if [ -z "$user" ]; then
              sudo $cmd >> "$stdout_log" 2>> "$stderr_log" &
          else
              sudo -u "$user" $cmd >> "$stdout_log" 2>> "$stderr_log" &
          fi
          echo $! > "$pid_file"
          if ! is_running; then
              echo "Unable to start, see $stdout_log and $stderr_log"
              exit 1
          fi
      fi
    ;;
    stop)
      if is_running; then
          echo -n "Stopping $name.."
          kill `get_pid`
          for i in {1..10}
          do
              if ! is_running; then
                  break
              fi

              echo -n "."
              sleep 1
          done
          echo

          if is_running; then
              echo "Not stopped; may still be shutting down or shutdown may have failed"
              exit 1
          else
              echo "Stopped"
              if [ -f "$pid_file" ]; then
                  rm "$pid_file"
              fi
          fi
      else
          echo "Not running"
      fi
    ;;
    restart)
      $0 stop
      if is_running; then
          echo "Unable to stop, will not attempt to start"
          exit 1
      fi
      $0 start
    ;;
    reload)
      if [ -z "$reload" ]; then
          echo "Unable to reload, the service does not provide such command."
          exit 1
      else
        cd "$wd"
        if [ -z "$user" ]; then
            sudo $reload
        else
            sudo -u "$user" $reload
        fi
      fi
    ;;
    status)
      if is_running; then
          echo "Running"
      else
          echo "Stopped"
          exit 1
      fi
    ;;
    *)
      echo "Usage: $0 {start|stop|restart|reload|status}"
      exit 1
    ;;
esac

exit 0
