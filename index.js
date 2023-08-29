const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const ScorePacman = document.querySelector('#ScorePacman')

// console.log(context)

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// Map Boundaries
class Boundary{
    static width = 40
    static height = 40

    constructor({position, image}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    // to determine how the boundary looks
    draw() {
        // context.fillStyle = 'blue'
        // context.fillRect(this.position.x, this.position.y, this.width, this.height)

        context.drawImage(this.image, this.position.x, this.position.y)
    }
}

// Pacman
class Pacman {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
    }

    draw() {
        context.save()
        context.translate(this.position.x, this.position.y)
        context.rotate(this.rotation)
        context.translate(-this.position.x, -this.position.y)
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        context.lineTo(this.position.x, this.position.y)
        context.fillStyle = 'yellow'
        context.fill()
        context.closePath()
        context.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if(this.radians < 0 || this.radians > .75) this.openRate = -this.openRate

        this.radians += this.openRate
    }
}

// Ghosts
class Ghost {
    static speed = 2
    constructor({position, velocity, color = 'red'}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scare = false
    }

    draw() {
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = this.scare ? 'blue' : this.color
        context.fill()
        context.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Pacman's Fruit
class Pellet {
    constructor({position}) {
        this.position = position
        this.radius = 3
    }

    draw() {
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = 'white'
        context.fill()
        context.closePath()
    }
}

// Eat da ghosts
class PowerUp {
    constructor({position}) {
        this.position = position
        this.radius = 7.5
    }

    draw() {
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = 'white'
        context.fill()
        context.closePath()
    }
}

const pellets = []
const boundaries = []
const powerUps = []
const ghosts = [
    new Ghost({
        position : {
            x : Boundary.width * 6 + Boundary.width / 2,
            y : Boundary.height + Boundary.height / 2
        },
        velocity : {
            x : Ghost.speed,
            y : 0
        }
    }),
    new Ghost({
        position : {
            x : Boundary.width * 4 + Boundary.width / 2,
            y : Boundary.height * 5 + Boundary.height / 2
        },
        velocity : {
            x : -Ghost.speed,
            y : 0
        },
        color : 'orange'
    }),
    new Ghost({
        position : {
            x : Boundary.width * 9 + Boundary.width / 2,
            y : Boundary.height * 9 + Boundary.height / 2
        },
        velocity : {
            x : 0,
            y : Ghost.speed
        },
        color : 'pink'
    }),
    new Ghost({
        position : {
            x : Boundary.width + Boundary.width / 2,
            y : Boundary.height * 11 + Boundary.height / 2
        },
        velocity : {
            x : Ghost.speed,
            y : 0
        },
        color : 'green'
    }),
]
const pacman = new Pacman({
    position : {
        x : Boundary.width + Boundary.width / 2,
        y : Boundary.height + Boundary.height / 2
    },
    velocity : {
        x : 0,
        y : 0
    }
})

const keys = {
    w : {
        pressed : false
    },
    a : {
        pressed : false
    },
    s : {
        pressed : false
    },
    d : {
        pressed : false
    }
}

let lastKey = ''
let score = 0

// Game Map
const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', 'p', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', 'p', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['3', '-', '-', '-', '-', '-', '-', '-', '-', '-', '4']
]

// Image for the map
function createImage(src){
    const image = new Image()
    image.src = src
    return image
}

// Map Design Switchcases
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        // console.log(symbol)
        switch(symbol) {
            case '-' :
                boundaries.push(
                    new Boundary({
                        position : {
                            x : Boundary.width * j,
                            y : Boundary.height * i
                        },
                        image : createImage('./img/pipeHorizontal.png')
                    })
                )
            break
            case '|' :
                boundaries.push(
                    new Boundary({
                        position : {
                            x : Boundary.width * j,
                            y : Boundary.height * i
                        },
                        image : createImage('./img/pipeVertical.png')
                    })
                )
            break
            case '1' :
                boundaries.push(
                    new Boundary({
                        position : {
                            x : Boundary.width * j,
                            y : Boundary.height * i
                        },
                        image : createImage('./img/pipeCorner1.png')
                    })
                )
            break
            case '2' :
                boundaries.push(
                    new Boundary({
                        position : {
                            x : Boundary.width * j,
                            y : Boundary.height * i
                        },
                        image : createImage('./img/pipeCorner2.png')
                    })
                )
            break
            case '3' :
                boundaries.push(
                    new Boundary({
                        position : {
                            x : Boundary.width * j,
                            y : Boundary.height * i
                        },
                        image : createImage('./img/pipeCorner3.png')
                    })
                )
            break
            case '4' :
                boundaries.push(
                    new Boundary({
                        position : {
                            x : Boundary.width * j,
                            y : Boundary.height * i
                        },
                        image : createImage('./img/pipeCorner4.png')
                    })
                )
            break
            case 'b' :
                boundaries.push(
                    new Boundary({
                        position : {
                            x : Boundary.width * j,
                            y : Boundary.height * i
                        },
                        image : createImage('./img/block.png')
                    })
                )
            break
            case '[':
                boundaries.push(
                  new Boundary({
                    position: {
                      x: j * Boundary.width,
                      y: i * Boundary.height
                    },
                    image: createImage('./img/capLeft.png')
                  })
                )
            break
            case ']':
                boundaries.push(
                  new Boundary({
                    position: {
                      x: j * Boundary.width,
                      y: i * Boundary.height
                    },
                    image: createImage('./img/capRight.png')
                  })
                )
            break
            case '_':
                boundaries.push(
                  new Boundary({
                    position: {
                      x: j * Boundary.width,
                      y: i * Boundary.height
                    },
                    image: createImage('./img/capBottom.png')
                  })
                )
            break
            case '^':
                boundaries.push(
                  new Boundary({
                    position: {
                      x: j * Boundary.width,
                      y: i * Boundary.height
                    },
                    image: createImage('./img/capTop.png')
                  })
                )
            break
            case '+':
                boundaries.push(
                  new Boundary({
                    position: {
                      x: j * Boundary.width,
                      y: i * Boundary.height
                    },
                    image: createImage('./img/pipeCross.png')
                  })
                )
            break
            case '5':
                boundaries.push(
                  new Boundary({
                    position: {
                      x: j * Boundary.width,
                      y: i * Boundary.height
                    },
                    color: 'blue',
                    image: createImage('./img/pipeConnectorTop.png')
                  })
                )
            break
            case '6':
                boundaries.push(
                  new Boundary({
                    position: {
                      x: j * Boundary.width,
                      y: i * Boundary.height
                    },
                    color: 'blue',
                    image: createImage('./img/pipeConnectorRight.png')
                  })
                )
            break
            case '7':
                boundaries.push(
                  new Boundary({
                    position: {
                      x: j * Boundary.width,
                      y: i * Boundary.height
                    },
                    color: 'blue',
                    image: createImage('./img/pipeConnectorBottom.png')
                  })
                )
            break
            case '8':
                boundaries.push(
                  new Boundary({
                    position: {
                      x: j * Boundary.width,
                      y: i * Boundary.height
                    },
                    image: createImage('./img/pipeConnectorLeft.png')
                  })
                )
            break
            case '.':
                pellets.push(
                  new Pellet({
                    position: {
                      x: j * Boundary.width + Boundary.width / 2,
                      y: i * Boundary.height + Boundary.height / 2
                    }
                  })
                )
            break
            case 'p':
                powerUps.push(
                  new PowerUp({
                    position: {
                      x: j * Boundary.width + Boundary.width / 2,
                      y: i * Boundary.height + Boundary.height / 2
                    }
                  })
                )
            break
        }
    })
})

// Collisions
function circleCollideWithRectangle({circle, rectangle}) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
        && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
        && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
        && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
    )
}

let animationId

// Move Animations
function animate() {
    animationId = requestAnimationFrame(animate)
    // console.log(animationId)
    // console.log('test')
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    if(keys.w.pressed && lastKey === 'w') {
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(
                circleCollideWithRectangle({
                    circle : {...pacman, velocity : {
                        x : 0,
                        y : -5
                    }},
                    rectangle : boundary
                })
            ) {
                pacman.velocity.y = 0
                break
            } else {
                pacman.velocity.y = -5
            }
        }
    }else if(keys.a.pressed && lastKey === 'a') {
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(
                circleCollideWithRectangle({
                    circle : {...pacman, velocity : {
                        x : -5,
                        y : 0
                    }},
                    rectangle : boundary
                })
            ) {
                pacman.velocity.x = 0
                break
            } else {
                pacman.velocity.x = -5
            }
        }
    }else if(keys.s.pressed && lastKey === 's') {
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(
                circleCollideWithRectangle({
                    circle : {...pacman, velocity : {
                        x : 0,
                        y : 5
                    }},
                    rectangle : boundary
                })
            ) {
                pacman.velocity.y = 0
                break
            } else {
                pacman.velocity.y = 5
            }
        }
    }else if(keys.d.pressed && lastKey === 'd') {
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(
                circleCollideWithRectangle({
                    circle : {...pacman, velocity : {
                        x : 5,
                        y : 0
                    }},
                    rectangle : boundary
                })
            ) {
                pacman.velocity.x = 0
                break
            } else {
                pacman.velocity.x = 5
            }
        }
    }

    // Pacman / Ghost Collide
    for(let i = ghosts.length - 1; 0 <= i; i--) {
        const ghost = ghosts[i]

        if(Math.hypot(
            ghost.position.x - pacman.position.x, 
            ghost.position.y - pacman.position.y
        ) < ghost.radius + pacman.radius) {
            if(ghost.scare) {
                ghosts.splice(i, 1)
            }else {
                cancelAnimationFrame(animationId)
                window.alert('YOU LOSE !')
            }
        }
    }

    // WIN
    if(pellets.length === 0 || ghosts.length === 0) {
        window.alert('YOU WIN !')
        cancelAnimationFrame(animationId)
    }

    // Power consume
    for(let i = powerUps.length - 1; 0 <= i; i--) {
        const powerUp = powerUps[i]
        powerUp.draw()

        // Pacman meets powerup
        if(Math.hypot(
            powerUp.position.x - pacman.position.x, 
            powerUp.position.y - pacman.position.y
        ) < powerUp.radius + pacman.radius) {
            powerUps.splice(i, 1)

            // Powerup effect
            ghosts.forEach((ghost) => {
                ghost.scare = true
                setTimeout(() => {
                    ghost.scare = false
                }, 3000)
            })
        }
    }

    // Touch pellets
    for(let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i]
        pellet.draw()

        if(Math.hypot(
            pellet.position.x - pacman.position.x, 
            pellet.position.y - pacman.position.y
            ) < pellet.radius + pacman.radius) {
                // console.log('touch')
                pellets.splice(i, 1)
                score += 20
                ScorePacman.innerHTML = score
            }
    }

    boundaries.forEach((boundary) => {
        boundary.draw()
        
        if(
            circleCollideWithRectangle({
                circle : pacman,
                rectangle : boundary
            })
        ){
            pacman.velocity.x = 0
            pacman.velocity.y = 0
        }
    })
    pacman.update()
    // pacman.velocity.x = 0
    // pacman.velocity.y = 0

    ghosts.forEach((ghost) => {
        ghost.update()

        const collisions = []
        boundaries.forEach((boundary) => {
            if(
                !collisions.includes('right') &&
                circleCollideWithRectangle({
                    circle : {...ghost, velocity : {
                        x : ghost.speed,
                        y : 0
                    }},
                    rectangle : boundary
                })
            ) {
                collisions.push('right')
            }
            if(
                !collisions.includes('left') &&
                circleCollideWithRectangle({
                    circle : {...ghost, velocity : {
                        x : -ghost.speed,
                        y : 0
                    }},
                    rectangle : boundary
                })
            ) {
                collisions.push('left')
            }
            if(
                !collisions.includes('up') &&
                circleCollideWithRectangle({
                    circle : {...ghost, velocity : {
                        x : 0,
                        y : -ghost.speed
                    }},
                    rectangle : boundary
                })
            ) {
                collisions.push('up')
            }
            if(
                !collisions.includes('down') &&
                circleCollideWithRectangle({
                    circle : {...ghost, velocity : {
                        x : 0,
                        y : ghost.speed
                    }},
                    rectangle : boundary
                })
            ) {
                collisions.push('down')
            }
        })
        if(collisions.length > ghost.prevCollisions.length){
            ghost.prevCollisions = collisions
        }
        if(JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
            // console.log('test')

            if(ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if(ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if(ghost.velocity.y < 0) ghost.prevCollisions.push('up')
            else if(ghost.velocity.y > 0) ghost.prevCollisions.push('down')
            
            console.log(collisions)
            console.log(ghost.prevCollisions)

            const pathway = ghost.prevCollisions.filter((collision) => {
                return !collisions.includes(collision)
            })
            console.log({pathway})

            const direction = pathway[Math.floor(Math.random() * pathway.length)]

            console.log({direction})

            switch(direction) {
                case 'down' :
                    ghost.velocity.x = 0
                    ghost.velocity.y = ghost.speed
                break
                case 'up' :
                    ghost.velocity.x = 0
                    ghost.velocity.y = -ghost.speed
                break
                case 'right' :
                    ghost.velocity.x = ghost.speed
                    ghost.velocity.y = 0
                break
                case 'left' :
                    ghost.velocity.x = -ghost.speed
                    ghost.velocity.y = 0
                break
            }

            ghost.prevCollisions = []
        }

        // console.log(collisions)
    })
    if(pacman.velocity.x > 0) pacman.rotation = 0
    else if(pacman.velocity.x < 0) pacman.rotation = Math.PI
    else if(pacman.velocity.y > 0) pacman.rotation = Math.PI / 2
    else if(pacman.velocity.y < 0) pacman.rotation = Math.PI * 1.5
}

animate()

// Movement Controls
addEventListener('keydown', ({key}) => {
    switch(key) {
        case 'w' :
            keys.w.pressed = true
            lastKey = 'w'
        break
        case 'a' :
            keys.a.pressed = true
            lastKey = 'a'
        break
        case 's' :
            keys.s.pressed = true
            lastKey = 's'
        break
        case 'd' :
            keys.d.pressed = true
            lastKey = 'd'
        break
    }
})

addEventListener('keyup', ({key}) => {
    switch(key) {
        case 'w' :
            keys.w.pressed = false
        break
        case 'a' :
            keys.a.pressed = false
        break
        case 's' :
            keys.s.pressed = false
        break
        case 'd' :
            keys.d.pressed = false
        break
    }
})