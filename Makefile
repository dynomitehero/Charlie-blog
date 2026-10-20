# Standard Makefile for SGDK (Sega Genesis Development Kit)

ifneq ($(wildcard $(GDK)/makefile.gen),)
  include $(GDK)/makefile.gen
else
  $(info SGDK path (GDK variable) is not defined or makefile.gen not found.)
  all:
	@echo "SGDK environment not detected. Native Genesis ROM build skipped in this environment."
endif
