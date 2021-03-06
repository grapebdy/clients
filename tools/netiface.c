#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <netdb.h>
#include <net/if.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <sys/types.h>

#define MAC_SIZE    18
#define IP_SIZE     16

int get_local_mac(const char *eth_inf, char *mac)
{
	struct ifreq ifr;
	int sd;

	bzero(&ifr, sizeof(struct ifreq));
	if( (sd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
		printf("get %s mac address socket creat error\n", eth_inf);
		return -1;
	}

	strncpy(ifr.ifr_name, eth_inf, sizeof(ifr.ifr_name) - 1);

	if(ioctl(sd, SIOCGIFHWADDR, &ifr) < 0) {
		printf("get %s mac address error\n", eth_inf);
		close(sd);
		return -1;
	}

	snprintf(mac, MAC_SIZE, "%02x%02x%02x%02x%02x%02x",
			(unsigned char)ifr.ifr_hwaddr.sa_data[0],
			(unsigned char)ifr.ifr_hwaddr.sa_data[1],
			(unsigned char)ifr.ifr_hwaddr.sa_data[2],
			(unsigned char)ifr.ifr_hwaddr.sa_data[3],
			(unsigned char)ifr.ifr_hwaddr.sa_data[4],
			(unsigned char)ifr.ifr_hwaddr.sa_data[5]);

	close(sd);

	return 0;
}

int get_local_ip(const char *eth_inf, char *ip)
{
	int sd;
	struct sockaddr_in sin;
	struct ifreq ifr;

	sd = socket(AF_INET, SOCK_DGRAM, 0);
	if (-1 == sd) {
	    printf("socket error: %s\n", strerror(errno));
	    return -1;
	}

	strncpy(ifr.ifr_name, eth_inf, IFNAMSIZ);
	ifr.ifr_name[IFNAMSIZ - 1] = 0;

	// if error: No such device
	if (ioctl(sd, SIOCGIFADDR, &ifr) < 0) {
	    printf("ioctl error: %s\n", strerror(errno));
	    close(sd);
	    return -1;
	}

	memcpy(&sin, &ifr.ifr_addr, sizeof(sin));
	snprintf(ip, IP_SIZE, "%s", inet_ntoa(sin.sin_addr));

	close(sd);
	return 0;
}

void do_help(void)
{
	printf("netiface usage\n");
	printf("\t-i\t\t get ip address\n");
	printf("\t-m\t\t get mac address\n");
	printf("\t-d\t\t specific net device\n");
}

#define OPT_IP		0x5a
#define OPT_MAC		0x5b

int main(int argc, char *argv[])
{
	int opt;
	char data[1024] = {0};
	char ethname[100] = {0};
	int type = OPT_IP;
	int deven = 0;
	while ((opt = getopt(argc,argv,"imd:")) != -1) {
		switch (opt) {
		case 'd':
			memcpy(ethname, optarg, strlen(optarg));
			deven = 1;
			break;
		case 'i':
			type = OPT_IP;
			break;

		case 'm':
			type = OPT_MAC;
			break;
		}
	}

	if (!deven) {
		do_help();
		return -1;
	}

	switch (type) {
	case OPT_IP:
		get_local_ip(ethname, data);
		printf("%s\n", data);
		break;
	case OPT_MAC:
		get_local_mac(ethname, data);
		printf("%s\n", data);
		break;
	}

	return 0;
}
