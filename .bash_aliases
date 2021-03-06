# Shutdown
alias sd="systemctl poweroff"

# Pacman shorts
alias add="sudo pacman -S"
alias remove="sudo pacman -Rs"

# Proton vpn
alias vpn="protonvpn-cli c"
alias vpnoff="protonvpn-cli d"

# kamoso
alias camera="kamoso"

### ARCHIVE EXTRACTION
# usage: extract <file>
extract ()
{
  if [ -f $1 ] ; then
    case $1 in
      *.tar.bz2)   tar xjf $1   ;;
      *.tar.gz)    tar xzf $1   ;;
      *.bz2)       bunzip2 $1   ;;
      *.rar)       unrar x $1   ;;
      *.gz)        gunzip $1    ;;
      *.tar)       tar xf $1    ;;
      *.tbz2)      tar xjf $1   ;;
      *.tgz)       tar xzf $1   ;;
      *.zip)       unzip $1     ;;
      *.Z)         uncompress $1;;
      *.7z)        7z x $1      ;;
      *.deb)       ar x $1      ;;
      *.tar.xz)    tar xf $1    ;;
      *.tar.zst)   unzstd $1    ;;      
      *)           echo "'$1' cannot be extracted via extract()" ;;
    esac
  else
    echo "'$1' is not a valid file"
  fi
}

### Power Mode Options
# usage: powermode <options/which/powersave/performance>
powermode ()
{
  case $1 in
    which)        cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor                         ;;
    options)      cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors              ;;
    performance)  echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor ;;
    powersave)    echo powersave | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor   ;;
    *)            echo " Invalid Argument: Choose from - which, options, performance, powersave "   ;;
  esac
}

### Webpack Vanilla Setup
# usage: webpack
webpack ()
{
  cp ~/aliases/boilerplates/webpack/webpack.config.js ./
  cp ~/aliases/boilerplates/webpack/package.json ./
  yarn
  case $1 in
    three)
      cp -r ~/aliases/boilerplates/webpack/three/src ./src
      cp -r ~/aliases/boilerplates/webpack/three/dist ./dist
      yarn add three dat.gui gsap ;;
    *) echo " Invalid Argument: Choose from - three, <no argument> "   ;;
  esac
  if [ "$#" -eq 0 ]; then
    cp -r ~/aliases/boilerplates/webpack/src ./src
    mkdir dist
  fi
  yarn run dev

}

# svelte setup
	alias svelte="unzip ~/aliases/boilerplates/svelte/svelte.zip -d ./ && mv ./template-master/** . && mv ./template-master/.gitignore . && rm -rf ./template-master && yarn"

### Add React Functional Component
# usage: rfc <component_name>
rfc ()
{
echo 'function '$1'(props) {' >> $1.js
echo '  return (' >> $1.js
echo '    <div className="'$1'">' >> $1.js
echo '    </div>' >> $1.js
echo '  );' >> $1.js
echo '}' >> $1.js
echo '' >> $1.js
echo 'export default '$1';' >> $1.js
}

### RUN AS PYTHON
# usage: pyrun <python code>
pyrun ()
{
echo -e $1 > ~/pyrun_temp.py
python ~/pyrun_temp.py
rm ~/pyrun_temp.py
}

### Make Directory and enter it
# usage: mkcd <dirname>
mkcd ()
{
mkdir $1
cd $1
}

# add css scoper for react
alias scopecss='cp ~/aliases/boilerplates/react/scopeCss.js ./'

# navigation
alias ..='cd ..' 
alias ...='cd ../..'
alias .3='cd ../../..'
alias .4='cd ../../../..'
alias .5='cd ../../../../..'

# Colorize grep output (good for log files)
alias grep='grep --color=auto'
alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'

# watch gpu statistics
alias watchgpu='watch --color gpustat --color'

## get top process eating memory
alias psmem='ps auxf | sort -nr -k 4'
alias psmem10='ps auxf | sort -nr -k 4 | head -10'


# git
alias addup='git add -u'
alias addall='git add .'
alias branch='git branch'
alias checkout='git checkout'
alias clone='git clone'
alias commit='git commit -m'
alias fetch='git fetch'
alias pull='git pull origin'
alias push='git push origin'
alias status='git status'
alias tag='git tag'
alias newtag='git tag -a'

# youtube-dl
alias yta-aac="youtube-dl --extract-audio --audio-format aac "
alias yta-best="youtube-dl --extract-audio --audio-format best "
alias yta-flac="youtube-dl --extract-audio --audio-format flac "
alias yta-m4a="youtube-dl --extract-audio --audio-format m4a "
alias yta-mp3="youtube-dl --extract-audio --audio-format mp3 "
alias yta-opus="youtube-dl --extract-audio --audio-format opus "
alias yta-vorbis="youtube-dl --extract-audio --audio-format vorbis "
alias yta-wav="youtube-dl --extract-audio --audio-format wav "
alias ytv-best="youtube-dl -f bestvideo+bestaudio "
