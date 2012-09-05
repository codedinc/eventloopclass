# Sample event loop in Ruby
require "socket"

class Loop
  attr_reader :reads
  attr_reader :writes
  
  def initialize
    @reads = {}
    @writes = {}
  end
  
  def on_readable(io, &block)
    @reads[io] = block
  end
  
  def on_writable(io, &block)
    @writes[io] = block
  end
  
  def run
    while true
      readables, writables, errors = IO.select(@reads.keys, @writes.keys)
      readables.each { |io| @reads[io].call }
      writables.each { |io| @writes[io].call }
    end
  end
end

server = TCPServer.new('localhost', 8080)

event_loop = Loop.new

event_loop.on_readable server do
  client = server.accept_nonblock
  
  event_loop.on_readable client do
    begin
      puts client.read_nonblock(1024)
    rescue EOFError, Errno::ECONNRESET
      client.close
      event_loop.reads.delete(client)
    end
  end
  
  event_loop.on_writable client do
    client.write_nonblock "hello"
    event_loop.writes.delete(client)
  end
end

event_loop.run