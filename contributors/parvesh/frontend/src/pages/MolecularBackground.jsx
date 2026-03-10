import React, { useEffect, useRef } from 'react';

const MolecularBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let molecules = [];
        let atoms = []; 

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initMolecules();
            if (atoms.length === 2) {
                atoms[0].anchorX = canvas.width * 0.1;
                atoms[0].anchorY = canvas.height * 0.2;
                atoms[1].anchorX = canvas.width * 0.9;
                atoms[1].anchorY = canvas.height * 0.8;
            }
        };

        let mouse = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2,
            radius: 200, 
            isClicked: false,
            draggedAtom: null, 
            energyLevel: 0.01 
        };

        const handleMouseMove = (e) => {
            mouse.targetX = e.clientX;
            mouse.targetY = e.clientY;

            if (mouse.draggedAtom) {
                mouse.draggedAtom.anchorX = e.clientX;
                mouse.draggedAtom.anchorY = e.clientY;
            }
        };

        const handleMouseDown = (e) => { 
            for (let atom of atoms) {
                const dist = Math.sqrt((mouse.targetX - atom.x) ** 2 + (mouse.targetY - atom.y) ** 2);
                if (dist < 100) { 
                    mouse.draggedAtom = atom;
                    return; 
                }
            }
            mouse.isClicked = true; 
        };

        const handleMouseUp = () => { 
            mouse.isClicked = false; 
            mouse.draggedAtom = null; 
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        // --- 1. THE DRAGGABLE QUANTUM ATOMS ---
        class QuantumAtom {
            constructor(startX, startY) {
                this.time = Math.random() * 100; 
                this.anchorX = startX;
                this.anchorY = startY;
                this.x = startX;
                this.y = startY;
                
                this.electronAngles = [0, Math.PI / 2, Math.PI];
                this.orbitRotations = [0, Math.PI / 3, (2 * Math.PI) / 3]; 
            }

            draw() {
                this.time += 0.005;
                this.baseRadiusX = Math.min(canvas.width, canvas.height) * 0.12; 
                this.baseRadiusY = this.baseRadiusX * 0.35; 

                if (mouse.draggedAtom === this) {
                    this.x = this.anchorX;
                    this.y = this.anchorY;
                } else {
                    this.x = this.anchorX + Math.sin(this.time) * 15; 
                    this.y = this.anchorY + Math.cos(this.time * 0.8) * 15;
                }

                if (this.anchorX < 30) this.anchorX = 30;
                if (this.anchorX > canvas.width - 30) this.anchorX = canvas.width - 30;
                if (this.anchorY < 30) this.anchorY = 30;
                if (this.anchorY > canvas.height - 30) this.anchorY = canvas.height - 30;

                const tiltX = (mouse.x - this.x) * 0.05;
                const tiltY = (mouse.y - this.y) * 0.05;
                const dynamicRadiusY = Math.max(20, this.baseRadiusY + tiltY);

                const distToCenter = Math.sqrt((mouse.x - this.x) ** 2 + (mouse.y - this.y) ** 2);
                let targetEnergy = 0.003; 
                if (mouse.draggedAtom === this || distToCenter < this.baseRadiusX * 2 || mouse.isClicked) {
                    targetEnergy = (mouse.draggedAtom === this || mouse.isClicked) ? 0.08 : 0.03; 
                }
                mouse.energyLevel += (targetEnergy - mouse.energyLevel) * 0.05; 

                ctx.beginPath();
                ctx.arc(this.x - tiltX, this.y - tiltY, 12, 0, Math.PI * 2);
                
                ctx.fillStyle = mouse.draggedAtom === this ? '#ffffff' : 'rgba(96, 165, 250, 0.9)';
                ctx.shadowBlur = mouse.draggedAtom === this ? 60 : 40;
                ctx.shadowColor = '#60a5fa';
                ctx.fill();
                ctx.shadowBlur = 0;

                for (let i = 0; i < 3; i++) {
                    ctx.save();
                    ctx.translate(this.x - tiltX, this.y - tiltY);
                    ctx.rotate(this.orbitRotations[i] + tiltX * 0.002);

                    ctx.beginPath();
                    ctx.ellipse(0, 0, this.baseRadiusX, dynamicRadiusY, 0, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(148, 163, 184, ${0.3 + mouse.energyLevel})`; 
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    this.electronAngles[i] += mouse.energyLevel;
                    const ex = this.baseRadiusX * Math.cos(this.electronAngles[i]);
                    const ey = dynamicRadiusY * Math.sin(this.electronAngles[i]);

                    ctx.beginPath();
                    ctx.arc(ex, ey, 6, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#60a5fa';
                    ctx.fill();
                    
                    ctx.restore();
                }
            }
        }

        // --- 2. MOLECULES ---
        const colors = [
            'rgba(239, 68, 68, 0.8)',  // Red 
            'rgba(255, 255, 255, 0.8)',// White 
            'rgba(59, 130, 246, 0.8)', // Blue 
            'rgba(16, 185, 129, 0.8)'  // Green 
        ];

        class Molecule {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.angle = Math.random() * Math.PI * 2;
                this.spin = (Math.random() - 0.5) * 0.01;
                this.size = Math.random() * 2 + 1.5;
                
                const rand = Math.random();
                if (rand < 0.60) this.type = 'single';      
                else if (rand < 0.80) this.type = 'bent';   
                else if (rand < 0.95) this.type = 'linear'; 
                else this.type = 'ring';                    
                
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.spin;

                if (this.x > canvas.width + 50) this.x = -50;
                if (this.x < -50) this.x = canvas.width + 50;
                if (this.y > canvas.height + 50) this.y = -50;
                if (this.y < -50) this.y = canvas.height + 50;

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius && !mouse.draggedAtom) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= (dx / distance) * force * 1.5;
                    this.y -= (dy / distance) * force * 1.5;
                }

                this.draw();
            }

            drawAtom(px, py, radius, col) {
                ctx.beginPath();
                ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.fillStyle = col;
                ctx.fill();
            }

            drawBond(x1, y1, x2, y2) {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                const bondLen = this.size * 5;

                if (this.type === 'single') {
                    this.drawAtom(0, 0, this.size * 1.5, this.color);
                } 
                else if (this.type === 'linear') {
                    this.drawBond(-bondLen, 0, bondLen, 0);
                    this.drawAtom(0, 0, this.size * 1.2, this.color); 
                    this.drawAtom(-bondLen, 0, this.size * 0.9, 'rgba(255,255,255,0.9)'); 
                    this.drawAtom(bondLen, 0, this.size * 0.9, 'rgba(255,255,255,0.9)');  
                } 
                else if (this.type === 'bent') {
                    const angle1 = Math.PI / 4; 
                    const angle2 = (3 * Math.PI) / 4; 
                    const bx1 = Math.cos(angle1) * bondLen;
                    const by1 = Math.sin(angle1) * bondLen;
                    const bx2 = Math.cos(angle2) * bondLen;
                    const by2 = Math.sin(angle2) * bondLen;

                    this.drawBond(0, 0, bx1, by1);
                    this.drawBond(0, 0, bx2, by2);
                    this.drawAtom(0, 0, this.size * 1.5, this.color); 
                    this.drawAtom(bx1, by1, this.size * 0.8, 'rgba(255,255,255,0.9)'); 
                    this.drawAtom(bx2, by2, this.size * 0.8, 'rgba(255,255,255,0.9)'); 
                } 
                else if (this.type === 'ring') {
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const px = bondLen * 1.5 * Math.cos((i * Math.PI) / 3);
                        const py = bondLen * 1.5 * Math.sin((i * Math.PI) / 3);
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                    
                    for (let i = 0; i < 6; i++) {
                        const px = bondLen * 1.5 * Math.cos((i * Math.PI) / 3);
                        const py = bondLen * 1.5 * Math.sin((i * Math.PI) / 3);
                        this.drawAtom(px, py, this.size * 0.6, 'rgba(255,255,255,0.8)');
                    }
                }
                ctx.restore();
            }
        }

        const initMolecules = () => {
            molecules = [];
            // INCREASED DENSITY: Lowered divisor from 35000 to 22000
            const count = Math.floor((canvas.width * canvas.height) / 22000); 
            for (let i = 0; i < count; i++) {
                molecules.push(new Molecule());
            }
        };

        const drawCursorInteractions = () => {
            for (let i = 0; i < molecules.length; i++) {
                const dx = molecules[i].x - mouse.x;
                const dy = molecules[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < mouse.radius) {
                    ctx.beginPath();
                    ctx.moveTo(molecules[i].x, molecules[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(96, 165, 250, ${(1 - dist / mouse.radius) * 0.8})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        };

        const updateCursor = () => {
            let isHoveringAtom = false;
            for (let atom of atoms) {
                const dist = Math.sqrt((mouse.x - atom.x) ** 2 + (mouse.y - atom.y) ** 2);
                if (dist < 100) {
                    isHoveringAtom = true;
                    break;
                }
            }

            if (mouse.draggedAtom) {
                canvas.style.cursor = 'grabbing';
            } else if (isHoveringAtom) {
                canvas.style.cursor = 'grab';
            } else {
                canvas.style.cursor = 'default';
            }
        };

        const animate = () => {
            if (atoms.length === 0) {
                atoms.push(new QuantumAtom(window.innerWidth * 0.1, window.innerHeight * 0.2)); 
                atoms.push(new QuantumAtom(window.innerWidth * 0.9, window.innerHeight * 0.8)); 
            }

            mouse.x += (mouse.targetX - mouse.x) * 0.1;
            mouse.y += (mouse.targetY - mouse.y) * 0.1;

            updateCursor();

            ctx.fillStyle = '#020617'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width > canvas.height ? canvas.width : canvas.height
            );
            gradient.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
            gradient.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            atoms.forEach(atom => atom.draw());

            molecules.forEach(m => m.update());
            drawCursorInteractions();

            animationFrameId = requestAnimationFrame(animate);
        };

        resize(); 
        animate(); 

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'auto' 
            }}
        />
    );
};

export default MolecularBackground;