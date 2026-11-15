# Libera los puertos 3000 (backend) y 5173 (Vite) cerrando solo procesos node.
$puertos = 3000, 5173

foreach ($puerto in $puertos) {
    $conexiones = Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue
    if (-not $conexiones) {
        Write-Host "Puerto ${puerto} libre."
        continue
    }

    foreach ($conexion in $conexiones) {
        $pidProceso = $conexion.OwningProcess
        $proceso = Get-Process -Id $pidProceso -ErrorAction SilentlyContinue
        if (-not $proceso) {
            Write-Host "Puerto ${puerto}: proceso $pidProceso no encontrado (quizá ya terminó)."
            continue
        }

        if ($proceso.ProcessName -eq 'node') {
            Stop-Process -Id $pidProceso -Force -ErrorAction SilentlyContinue
            Write-Host "Puerto ${puerto}: cerrado proceso node '$($proceso.ProcessName)' (PID $pidProceso)."
        } else {
            Write-Warning "Puerto ${puerto}: PID $pidProceso es '$($proceso.ProcessName)', no es node. No se cierra."
        }
    }
}
