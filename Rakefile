require 'json'
task :default => :build

def header(prefix)
  info = JSON.load File.read('package.json')
  header = ["#{info['name']}: #{info['description']}, version: #{info['version']}"]
  header << "More info: #{info['url']}" << ''
  header.push(*File.read('LICENSE').lines)
  header.map! do |line|
    line << "\n" unless line.end_with? "\n"
    "" << prefix << line
  end
  header.join
end

def js_header(file)
  content = File.read(file)
  File.open(file, 'w') { |f| f << "/*\n" << header(" * ") << " */\n" << content }
end

desc 'adds the header to deferrable.coffee'
task(:header) do
  content = File.read('src/deferrable.coffee')
  content = header('# ') << content
  content.gsub! /^(#[^\n]*\n)+# copyright[^\n]*\n(#[^\n]*\n)+/, ''
  File.open('src/deferrable.coffee', 'w') { |f| f << header('# ') << content }
end

desc 'compile deferrable.js'
task(:build => :header) do
  sh 'coffee -o lib/ -c src/*.coffee'
  sh 'coffee -c test/*.coffee'
  js_header 'lib/deferrable.js'
end

desc 'minifies deferrable.js to deferrable.min.js'
task(:minify => :build) do
  sh 'java -jar yuicompressor-*.jar --type js -o lib/deferrable.min.js lib/deferrable.js'
  js_header 'lib/deferrable.min.js'
end

desc 'runs the tests'
task(:test => :build) do
  test = `node test/deferrable_test.js`
  puts test
  exit(1) unless test.end_with? " 0 failures\n"
end

desc 'build continuously on changes'
task(:watch) { sh 'watchr deferrable.watchr' }

desc 'generate js readme from coffee readme'
task(:readme) do
  def render(script, indent)
    File.open('tmp.coffee', 'w') { |f| f << script }
    `coffee -p --no-wrap tmp.coffee`.lines.map { |l| "#{indent}#{l}" }.join << "\n"
  end

  File.open('README.md', 'w') do |source|
    script = nil
    indent = " "*4
    File.read('README.coffee.md').each_line do |line|
      if line.start_with? indent
        script ||= ""
        script << line[indent.length..-1]
      else
        if script
          source << render(script, indent)
          script = nil
        end
        line.gsub!(/(Coffee|Java)Script/) { ($1 == "Java" ? "Coffee" : "Java") << "Script" }
        line.gsub! 'README', 'README.coffee'
        source << line
      end
    end
    source << render(script, indent) if script
    rm_f 'tmp.coffee'
  end
end
