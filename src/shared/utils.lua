local is_server = IsDuplicityVersion()

onReady = function(func)
  CreateThread(function()
    while not Core do Wait(500); end
    if not is_server then while not Core.Player.Ready() do Wait(500); end; end
    func()
  end)
end