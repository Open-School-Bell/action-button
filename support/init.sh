#! /bin/sh
# /etc/init.d/button

### BEGIN INIT INFO
# Provides:          sounder
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Open School Bell Action Button
# Description:       This file should be used to construct scripts to be
#                    placed in /etc/init.d.
### END INIT INFO

# Carry out specific functions when asked to by the system
case "$1" in
   start)
    echo "Starting button"
    # run application you want to start
    #node /home/pi/test.js > /home/pi/test.log
    button --start > /dev/null &
   ;;
   ensure)
    pid=$(cat /var/osb/action-button/button.pid)
    if ps -p $pid > /dev/null
    then
        echo "running"
    else
        /etc/init.d/button start
    fi
   ;;
   restart)
    /etc/init.d/button stop
    /etc/init.d/button start
   ;;
   stop)
    echo "Stopping button"
    # kill application you want to stop
    pid=$(cat /var/osb/action-button/button.pid)
    kill $pid
    rm /var/osb/sounder/button.pid
    # Not a great approach for running
    # multiple node instances
    ;;
  *)
    echo "Usage: /etc/init.d/button {start|stop}"
    exit 1
    ;;
esac

exit 0