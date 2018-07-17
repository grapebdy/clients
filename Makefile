CROSS_COMPILE=
CC=$(CROSS_COMPILE)gcc
CFLAGS=
OBJS= bin/netiface

GIT_DIRTY=`./setlocalversion`
GIT_VER=`git log --oneline | head -n 1 | cut -d ' ' -f 1`
TOOL_VERSION=clients-$(shell date +%Y%m%d)-$(GIT_VER)
INSTALL_DIR=

all: tools

tools: $(OBJS)

bin/%: bin/%.o
	$(CC)  -o $@ $<

bin/%.o: tools/%.c
	$(CC)  -c -o $@ $<

run: tools
	@./bin/start

clean:
	@rm -rf $(OBJS)
