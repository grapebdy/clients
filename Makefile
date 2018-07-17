CROSS_COMPILE=
CC=$(CROSS_COMPILE)gcc
CFLAGS=
OBJS= bin/netiface

all: tools

tools: $(OBJS)

run:
	@./bin/start

bin/%: bin/%.o
	$(CC)  -o $@ $<

bin/%.o: tools/%.c
	$(CC)  -c -o $@ $<

clean:
	@rm -rf $(OBJS)
